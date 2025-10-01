import argparse
import subprocess
import sys
import shutil
import tempfile
from pathlib import Path
import json
import os
import glob

import librosa
import soundfile as sf
from faster_whisper import WhisperModel

def run(cmd, env=None):
    p = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",     # <-- force UTF-8
        errors="replace",     # <-- never crash on unexpected bytes
        env={**os.environ, **(env or {})},
    )
    if p.returncode != 0:
        # Helpful to see the tool's output when something fails
        raise RuntimeError(f"Command failed:\n{' '.join(map(str, cmd))}\n\n{p.stdout}")
    return p.stdout

def ff(*args):
    return ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", *args]

def srt_time(t):
    ms = int(round((t - int(t)) * 1000))
    s = int(t) % 60
    m = (int(t) // 60) % 60
    h = int(t) // 3600
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def write_srt(segments, srt_path: Path):
    lines = []
    for i, seg in enumerate(segments, 1):
        lines += [
            str(i),
            f"{srt_time(seg['start'])} --> {srt_time(seg['end'])}",
            seg['text'].strip(),
            ""
        ]
    srt_path.write_text("\n".join(lines), encoding="utf-8")

def check_prereqs():
    if shutil.which("ffmpeg") is None:
        sys.exit("ERROR: ffmpeg not found on PATH. Install ffmpeg and try again.")
    # demucs runs via `python -m demucs.separate`; just ensure python is present (it is).
    # Torch + demucs are Python deps handled by requirements.txt.

def extract_audio_tracks(video: Path, tmp: Path):
    hi = tmp / "audio_highsr.wav"   # 44.1kHz mono for Demucs
    lo = tmp / "audio_asr16k.wav"   # 16kHz mono for Whisper
    run(ff("-y", "-i", str(video), "-ac", "1", "-ar", "44100", str(hi)))
    run(ff("-y", "-i", str(video), "-ac", "1", "-ar", "16000", str(lo)))
    return hi, lo

def separate_vocals(hi_wav: Path, tmp: Path, demucs_model: str):
    stems_root = tmp / "stems"
    run([sys.executable, "-m", "demucs.separate",
         "-n", demucs_model, "--two-stems", "vocals",
         "-o", str(stems_root), str(hi_wav)])
    demucs_dir = next((stems_root / demucs_model).glob(f"{hi_wav.stem}*"))
    vocals = Path(next(glob.iglob(str(demucs_dir / "vocals.*"))))
    background = Path(next(glob.iglob(str(demucs_dir / "no_vocals.*"))))
    return vocals, background

def pitch_shift(vocals_in: Path, semitones: float, vocals_out: Path):
    y, sr = librosa.load(str(vocals_in), sr=None, mono=True)
    y2 = librosa.effects.pitch_shift(y, sr=sr, n_steps=semitones)
    sf.write(str(vocals_out), y2, sr)

def mix_stems(anon_vocals: Path, background: Path, mixed_out: Path):
    # Keep it simple: amix with volumes at 1.0; output stereo, 44.1k
    run(ff("-y",
           "-i", str(anon_vocals), "-i", str(background),
           "-filter_complex",
           "[0:a]volume=1.0[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:normalize=0[aout]",
           "-map", "[aout]", "-ar", "44100", "-ac", "2", str(mixed_out)))

def mux_video(original_video: Path, mixed_wav: Path, out_video: Path, srt_path: Path | None, embed_subs: bool):
    # ALL -i first, then -map; embed subs as mov_text if requested
    cmd = ["ffmpeg", "-y",
           "-i", str(original_video),
           "-i", str(mixed_wav)]
    if embed_subs and srt_path and srt_path.exists():
        cmd += ["-i", str(srt_path)]
    cmd += ["-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k"]
    if embed_subs and srt_path and srt_path.exists():
        cmd += ["-map", "2:s:0", "-c:s", "mov_text"]
    cmd += ["-shortest", str(out_video)]
    run(cmd)

def transcribe_english(wav16k: Path, whisper_model: str, device: str):
    model = WhisperModel(whisper_model, device=device)  # device: "cpu" | "cuda" | "auto"
    # task="translate" forces English output
    segments, info = model.transcribe(str(wav16k), task="translate")
    segs = [{"start": s.start, "end": s.end, "text": (s.text or "").strip()} for s in segments]
    full_text = " ".join(s["text"] for s in segs).strip()
    return segs, full_text

def main():
    parser = argparse.ArgumentParser(description="Anonymize vocals in a video and produce an English transcript.")
    parser.add_argument("-m", "--mode", required=True, choices=["video"], help="Must be 'video'")
    parser.add_argument("-i", "--input", required=True, help="Path to input video file")
    parser.add_argument("-o", "--output", required=True, help="Path to output anonymized video file")
    parser.add_argument("--pitch", type=float, default=-5.0, help="Semitones to shift vocals (default: -5)")
    parser.add_argument("--whisper-model", default="small", help="faster-whisper model size (tiny|base|small|medium|large-v3, default: small)")
    parser.add_argument("--demucs-model", default="htdemucs", help="Demucs model (default: htdemucs)")
    parser.add_argument("--device", default="auto", help="Whisper device: cpu|cuda|auto (default: auto)")
    parser.add_argument("--no-embed-subs", action="store_true", help="Do not embed subtitles in the MP4")
    args = parser.parse_args()

    in_path = Path(args.input).expanduser().resolve()
    out_path = Path(args.output).expanduser().resolve()

    if not in_path.exists():
        sys.exit(f"Input not found: {in_path}")
    if args.mode != "video":
        sys.exit("This tool only supports -m video")

    check_prereqs()

    out_path.parent.mkdir(parents=True, exist_ok=True)
    srt_path = out_path.with_suffix(".srt")
    txt_path = out_path.with_suffix(".txt")
    json_path = out_path.with_suffix(".json")  # optional metadata dump

    with tempfile.TemporaryDirectory(prefix=f"vocal_anon_") as td:
        tmp = Path(td)

        # 1) Extract audio tracks
        hi, lo = extract_audio_tracks(in_path, tmp)

        # 2) Separate stems
        vocals, background = separate_vocals(hi, tmp, args.demucs_model)

        # 3) Transcribe (English) and write SRT/TXT
        segments, full_text = transcribe_english(lo, whisper_model=args.whisper_model, device=args.device)
        write_srt(segments, srt_path)
        txt_path.write_text(full_text + "\n", encoding="utf-8")
        json_path.write_text(json.dumps({"segments": segments}, ensure_ascii=False, indent=2), encoding="utf-8")

        # 4) Pitch-shift vocals
        anon_vocals = tmp / "anon_vocals.wav"
        pitch_shift(vocals, args.pitch, anon_vocals)

        # 5) Mix back with background
        mixed = tmp / "mixed.wav"
        mix_stems(anon_vocals, background, mixed)

        # 6) Mux onto original video (+ optional embedded subs)
        mux_video(in_path, mixed, out_path, srt_path, embed_subs=(not args.no_embed_subs))

    print(f"[ok] Wrote:\n  video: {out_path}\n  srt:   {srt_path}\n  txt:   {txt_path}\n  json:  {json_path}")

if __name__ == "__main__":
    main()
