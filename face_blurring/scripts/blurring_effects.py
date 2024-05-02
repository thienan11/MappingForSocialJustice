import cv2
import numpy as np
from skimage.segmentation import slic
from skimage.util import img_as_float
from scipy.ndimage.morphology import binary_dilation


# (YOLO) Apply a strong pixelation effect to a region of the image. 
def apply_pixelation(image, xmin, ymin, xmax, ymax, pixel_size=5):
    roi = image[ymin:ymax, xmin:xmax]
    height, width = roi.shape[:2]
    # Resize input to "pixelated" size with a very low resolution
    temp_image = cv2.resize(roi, (pixel_size, pixel_size), interpolation=cv2.INTER_LINEAR)
    # Scale back to original size
    pixelated_image = cv2.resize(temp_image, (width, height), interpolation=cv2.INTER_NEAREST)
    image[ymin:ymax, xmin:xmax] = pixelated_image


# (YOLO) Randomize pixels in face region of the image.
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


# (RetinaFace)
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

# (YOLO)
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


# def apply_superpixel_blurring(image, xmin, ymin, xmax, ymax, n_segments=100, sigma=5):
#     face_region = img_as_float(image[ymin:ymax, xmin:xmax])
#     segments = slic(face_region, n_segments=n_segments, sigma=sigma)
    
#     for segment_value in np.unique(segments):
#         mask = segments == segment_value
#         color_mean = np.mean(face_region[mask], axis=0)
#         face_region[mask] = color_mean

#     image[ymin:ymax, xmin:xmax] = (255 * face_region).astype(np.uint8)
#     return image

def apply_superpixel_blurring(image, xmin, ymin, xmax, ymax, n_segments=100, sigma=5, dilation_radius=10):
    face_region = img_as_float(image[ymin:ymax, xmin:xmax])
    segments = slic(face_region, n_segments=n_segments, sigma=sigma)
    
    for segment_value in np.unique(segments):
        mask = segments == segment_value
        # Dilate the mask to increase the area for blurring
        dilated_mask = binary_dilation(mask, structure=np.ones((dilation_radius, dilation_radius)))
        color_mean = np.mean(face_region[dilated_mask], axis=0)
        face_region[mask] = color_mean

    image[ymin:ymax, xmin:xmax] = (255 * face_region).astype(np.uint8)
    return image