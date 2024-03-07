import cv2
import torch
from ultralytics import YOLO
import tempfile


# Define the pixelation function
def pixelate(image, pixel_size=10):
    height, width = image.shape[:2]
    # Resize input to "pixelated" size
    temp_image = cv2.resize(image, (pixel_size, pixel_size), interpolation=cv2.INTER_LINEAR)
    # Scale back to original size
    pixelated_image = cv2.resize(temp_image, (width, height), interpolation=cv2.INTER_NEAREST)
    return pixelated_image


# Load the YOLOv8 model
model = YOLO('../models/yolov8n-face.pt')

# Open the video
video_path = "../data/Tehran_TestMedia/SharifSampleVideo.mp4"
cap = cv2.VideoCapture(video_path)

# Get video properties
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

fourcc = cv2.VideoWriter_fourcc(*'MP4V')  # or use 'XVID' if saving in .avi format
out = cv2.VideoWriter('./outputs/testDataOut/su003_video_out.mp4', fourcc, frame_rate, (frame_width, frame_height))

if not cap.isOpened():
    print("Error opening video file.")
    exit()

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
                    roi = frame[ymin:ymax, xmin:xmax]
                    blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
                    frame[ymin:ymax, xmin:xmax] = blurred_roi

        # Display the frame
        cv2.imshow('Blurred Faces', frame)

        # Write the frame into the file 'output_video.mp4'
        # out.write(frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):  # Press 'q' to exit
        break

# Release the video capture object and close all OpenCV windows
cap.release()
out.release()
cv2.destroyAllWindows()
