import cv2
import torch
from ultralytics import YOLO
import tempfile
import argparse
import numpy as np


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


# Apply a strong pixelation effect to a region of the image.
def apply_pixelation(image, xmin, ymin, xmax, ymax, pixel_size=5):
  roi = image[ymin:ymax, xmin:xmax]
  height, width = roi.shape[:2]
  # Resize input to "pixelated" size with a very low resolution
  temp_image = cv2.resize(roi, (pixel_size, pixel_size), interpolation=cv2.INTER_LINEAR)
  # Scale back to original size
  pixelated_image = cv2.resize(temp_image, (width, height), interpolation=cv2.INTER_NEAREST)
  image[ymin:ymax, xmin:xmax] = pixelated_image


# Processing and adding blur to images
def process_image(model, input_path, output_path):
  img = cv2.imread(input_path)
  results = model(input_path, conf=0.05)

  # Iterate over all tensors in the results list
  for detections in results:
    if isinstance(detections, torch.Tensor):
      for detection in detections:
        xmin, ymin, xmax, ymax, conf, class_id = detection

        # Convert coordinates to integers
        xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])

        # # Select the region of interest (ROI) in the image to blur
        # roi = img[ymin:ymax, xmin:xmax]
        # blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
        # # Replace the original image's region with the blurred region
        # img[ymin:ymax, xmin:xmax] = blurred_roi

        apply_pixelation(img, xmin, ymin, xmax, ymax)

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
  # frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

  # fourcc = cv2.VideoWriter_fourcc(*'MP4V')
  # out = cv2.VideoWriter(output_path, fourcc, frame_rate, (frame_width, frame_height))
  codec = get_codec(output_path)
  out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*codec), 20.0, (frame_width, frame_height))

  while True:
    ret, frame = cap.read()
    if not ret:
      break
    
    # Save the frame to a temporary file
    with tempfile.NamedTemporaryFile(suffix='.jpg') as tmpfile:
      cv2.imwrite(tmpfile.name, frame)

      # Perform inference using the temporary file path
      results = model(tmpfile.name, conf=0.05)

      # Process the results as before, applying blurring to each detected region
      for detections in results:
        if isinstance(detections, torch.Tensor):
          for detection in detections:
            xmin, ymin, xmax, ymax, conf, class_id = detection
            xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])

            # roi = frame[ymin:ymax, xmin:xmax]
            # blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
            # frame[ymin:ymax, xmin:xmax] = blurred_roi

            apply_pixelation(frame, xmin, ymin, xmax, ymax)

      out.write(frame)

  cap.release()
  out.release()


# Run program
if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Add face blurring to images or videos with YOLOv8 model.")
  parser.add_argument("-m", "--mode", required=True, choices=["image", "video"], help="Processing mode: image or video")
  parser.add_argument("-i", "--input", required=True, help="Input file path")
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
