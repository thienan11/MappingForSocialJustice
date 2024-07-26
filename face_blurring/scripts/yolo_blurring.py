import cv2
import torch
from ultralytics import YOLO
import tempfile
import argparse
import cvzone

from blurring_effects import *
from get_codec import get_codec_from_file
  

# Processing and adding blur to images
def process_image(model, input_path, output_path):
    img = cv2.imread(input_path)
    results = model.predict(input_path, conf=0.05)

    for info in results:
        parameters = info.boxes
        for box in parameters:
            xmin, ymin, xmax, ymax = box.xyxy[0]
            xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])
            # h, w = ymax - ymin, xmax - xmin
            # cvzone.cornerRect(img, (xmin, ymin, h, w), 20, rt=0)

            # apply_gaussian_and_pixelation(img, xmin, ymin, xmax, ymax)
            # apply_superpixel_blurring(img, xmin, ymin, xmax, ymax)
            # shuffle_pixels_in_region(img, xmin, ymin, xmax, ymax)
            # apply_random_sized_pixelation(img, xmin, ymin, xmax, ymax)

    # cv2.imshow("Image", img)
    # cv2.waitKey(0)
    cv2.imwrite(output_path, img)


# Processing and adding blur to videos
def process_video(model, input_path, output_path):
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print("Error opening video file.")
        exit()

    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

    # fourcc = cv2.VideoWriter_fourcc(*'MP4V')
    # out = cv2.VideoWriter(output_path, fourcc, frame_rate, (frame_width, frame_height))
    codec = get_codec_from_file(output_path)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*codec), frame_rate, (frame_width, frame_height)) # frame_rate = 20?

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
    
        # Skip every 3rd frame
        if frame_count % 3 == 0:
            frame_count += 1
            continue
      
        # Save the frame to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.jpg') as tmpfile:
            cv2.imwrite(tmpfile.name, frame)

            # Perform inference using the temporary file path
            results = model.predict(tmpfile.name, conf=0.05)

            # Process the results as before, applying blurring to each detected region
            for info in results:
                parameters = info.boxes
                for box in parameters:
                    xmin, ymin, xmax, ymax = box.xyxy[0]
                    xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])

                    # apply_pixelation(frame, xmin, ymin, xmax, ymax)
                    # randomize_pixels(frame, xmin, ymin, xmax, ymax)
                    # apply_gaussian_and_pixelation(frame, xmin, ymin, xmax, ymax)
                    # shuffle_pixels_in_region(frame, xmin, ymin, xmax, ymax)
                    # apply_random_sized_pixelation(frame, xmin, ymin, xmax, ymax)
                    apply_superpixel_blurring(frame, xmin, ymin, xmax, ymax)

            frame_count += 1
            out.write(frame)

    cap.release()
    out.release()


def yolo_face_blurring():
    parser = argparse.ArgumentParser(description="Add face blurring to images or videos with YOLOv8 model.")
    parser.add_argument("-m", "--mode", required=True, choices=["image", "video"], help="Processing mode: image or video")
    parser.add_argument("-i", "--input", required=True, help="Input file path")
    parser.add_argument("-o", "--output", required=True, help="Output file path")
    # parser.add_argument("--model", required=True, help="Path to the YOLO model")

    args = parser.parse_args()

    # Load the YOLOv8 model
    # model = YOLO(args.model)
    model = YOLO('../models/yolov8l-face.pt')

    if args.mode == "image":
        process_image(model, args.input, args.output)
    elif args.mode == "video":
        process_video(model, args.input, args.output)

# Run program
if __name__ == "__main__":
    yolo_face_blurring()