import cv2
import numpy as np

# Apply a strong pixelation effect to a region of the image.
def apply_pixelation(image, xmin, ymin, xmax, ymax, pixel_size=5):
    roi = image[ymin:ymax, xmin:xmax]
    height, width = roi.shape[:2]
    # Resize input to "pixelated" size with a very low resolution
    temp_image = cv2.resize(roi, (pixel_size, pixel_size), interpolation=cv2.INTER_LINEAR)
    # Scale back to original size
    pixelated_image = cv2.resize(temp_image, (width, height), interpolation=cv2.INTER_NEAREST)
    image[ymin:ymax, xmin:xmax] = pixelated_image


# Randomize pixels in face region of the image.
def randomize_pixels(image, xmin, ymin, xmax, ymax, pixel_size=5):
    # Generate a random pixel size for pixelation, ensuring it's at least 1
    pixel_size = np.random.randint(1, 10)  # Adjust the range as needed

    roi = image[ymin:ymax, xmin:xmax]
    height, width = roi.shape[:2]
    # Check if the region of interest is too small to be pixelated further
    if height > 0 and width > 0:
        # Resize input to "pixelated" size with a very low resolution
        temp_image = cv2.resize(roi, (pixel_size, pixel_size), interpolation=cv2.INTER_LINEAR)
        # Scale back to original size
        pixelated_image = cv2.resize(temp_image, (width, height), interpolation=cv2.INTER_NEAREST)
        image[ymin:ymax, xmin:xmax] = pixelated_image


# for retina face
def blur_and_pixelate_face_region(frame, facial_area, pixelation_size=5, blur_strength=(101, 101)):
    x, y, w, h = facial_area
    # Extract face region
    face_region = frame[y:h, x:w]
    # Apply a strong Gaussian Blur with increased kernel size
    blurred_face = cv2.GaussianBlur(face_region, blur_strength, 0)
    # Pixelate the blurred face region by resizing down and up with a smaller pixelation size
    small = cv2.resize(blurred_face, (pixelation_size, pixelation_size), interpolation=cv2.INTER_LINEAR)
    pixelated_face = cv2.resize(small, (w-x, h-y), interpolation=cv2.INTER_NEAREST)
    # Replace original face region with the pixelated one
    frame[y:h, x:w] = pixelated_face
    return frame

# for yolo
def apply_blur_and_pixelation(image, xmin, ymin, xmax, ymax, pixelation_size=10, blur_strength=(101, 101)):
    # Extract the region of interest
    face_region = image[ymin:ymax, xmin:xmax]

    # Apply Gaussian Blur
    blurred_face = cv2.GaussianBlur(face_region, blur_strength, 0)

    # Apply Pixelation
    # Resize to small, then scale back up
    small = cv2.resize(blurred_face, (pixelation_size, pixelation_size), interpolation=cv2.INTER_LINEAR)
    pixelated_face = cv2.resize(small, (face_region.shape[1], face_region.shape[0]), interpolation=cv2.INTER_NEAREST)

    # Replace the original region with the pixelated blurred region
    image[ymin:ymax, xmin:xmax] = pixelated_face