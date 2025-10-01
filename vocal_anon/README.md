# Vocal Anonymizer

- Anonymizes a speaker’s voice in a video by pitch-shifting the vocal stem and remixing it with the background audio.
- Produces a transcript, subtitles, and embeds the subtitles back into the output by default.
- TODO: Add a more secure anonymization method + add diarization

## Requirements

- **Python:** 3.9–3.12
- **FFmpeg:** must be installed and on your `PATH`  
  - macOS: `brew install ffmpeg`  
  - Ubuntu/Debian: `sudo apt-get install -y ffmpeg`  
  - Windows: install ffmpeg build and add it to PATH

If you have an NVIDIA GPU, you can speed up transcription by installing a CUDA build of PyTorch and using `--device cuda`.
I have not tested this myself.

## Install

1) Create/activate a virtual environment

2) Install Python dependencies

```bash
pip3 install -r requirements.txt
```

## Usage

Basic:

```bash
python whisper_pitchshift.py -m video -i "input.mp4" -o "output.mp4"
```

Options:

- `--pitch <float>`: semitones to shift vocals (default `-5.0`)
- `--whisper-model <name>`: `tiny|base|small|medium|large-v3` (default `small`)
- `--demucs-model <name>`: e.g., `htdemucs` (default)
- `--device <cpu|cuda|auto>`: device for faster-whisper (default `auto`)
- `--no-embed-subs`: don’t embed subtitles in the MP4 (still writes `.srt`)

## Outputs

Given `-o "output.mp4"`, the tool writes:

- `output.mp4` — original video stream with anonymized audio and embedded subtitles (unless `--no-embed-subs`)
- `output.srt` — sidecar subtitle file (always written)
- `output.txt` — plain English transcript
- `output.json` — segment timing + text metadata
