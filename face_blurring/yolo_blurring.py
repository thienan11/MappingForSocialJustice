import cv2
import torch
from ultralytics import YOLO
import tempfile
import argparse

# Determine the codec based on file extension
def get_codec(filename):
    extension = filename.split('.')[-1].lower()
    if extension in ['avi']:
        return 'XVID'
    elif extension in ['mp4']:
        return 'mp4v'
    elif extension in ['mov']:
        return 'avc1'
    else:
        raise ValueError("Unsupported file format")

# Processing and adding blur to images
def process_image(model, input_path, output_path):
    img = cv2.imread(input_path)
    results = model(input_path, conf=0.05)
    for detections in results:
        if isinstance(detections, torch.Tensor):
            for detection in detections:
                xmin, ymin, xmax, ymax, conf, class_id = detection
                xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])
                roi = img[ymin:ymax, xmin:xmax]
                blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
                img[ymin:ymax, xmin:xmax] = blurred_roi
    cv2.imwrite(output_path, img)

# Processing and adding blur to videos
def process_video(model, input_path, output_path):
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print("Error opening video file.")
        exit()

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

    # fourcc = cv2.VideoWriter_fourcc(*'MP4V')
    # out = cv2.VideoWriter(output_path, fourcc, frame_rate, (frame_width, frame_height))
    codec = get_codec(output_path)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*codec), 20.0, (frame_width, frame_height))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        with tempfile.NamedTemporaryFile(suffix='.jpg') as tmpfile:
            cv2.imwrite(tmpfile.name, frame)
            results = model(tmpfile.name, conf=0.05)
            for detections in results:
                if isinstance(detections, torch.Tensor):
                    for detection in detections:
                        xmin, ymin, xmax, ymax, conf, class_id = detection
                        xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])
                        roi = frame[ymin:ymax, xmin:xmax]
                        blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
                        frame[ymin:ymax, xmin:xmax] = blurred_roi

            out.write(frame)

    cap.release()
    out.release()

# Run program
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add face blurring to images or videos with YOLOv8 model.")
    parser.add_argument("-i", "--input", required=True, help="Input file path")
    parser.add_argument("-m", "--mode", required=True, choices=["image", "video"], help="Processing mode: image or video")
    parser.add_argument("-o", "--output", required=True, help="Output file path")
    # parser.add_argument("--model", required=True, help="Path to the YOLO model")

    args = parser.parse_args()

    # Load the YOLOv8 model
    # model = YOLO(args.model)
    model = YOLO('../models/yolov8n-face.pt')

    if args.mode == "image":
        process_image(model, args.input, args.output)
    elif args.mode == "video":
        process_video(model, args.input, args.output)
