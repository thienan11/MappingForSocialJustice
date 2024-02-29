import cv2
import torch
from ultralytics import YOLO

# Load the YOLOv8 model
model = YOLO('./models/yolov8n-face.pt')

# Open the image
path = "./data/Tehran_TestMedia/su001_photo.jpg"
img = cv2.imread(path)

# Perform inference
results = model(path, conf=0.05)

# Iterate over all tensors in the results list
for detections in results:
    if isinstance(detections, torch.Tensor):
        for detection in detections:
            xmin, ymin, xmax, ymax, conf, class_id = detection
            # Convert coordinates to integers
            xmin, ymin, xmax, ymax = map(int, [xmin, ymin, xmax, ymax])

            # Select the region of interest (ROI) in the image to blur
            roi = img[ymin:ymax, xmin:xmax]

            # Apply Gaussian blur to this region
            blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)

            # Replace the original image's region with the blurred region
            img[ymin:ymax, xmin:xmax] = blurred_roi

# Display the output image with blurred faces
cv2.imshow('Yolov8n output', img)
cv2.waitKey(0)  # Wait for a key press to exit
cv2.destroyAllWindows()  # Close the image window
