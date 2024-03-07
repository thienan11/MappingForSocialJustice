import cv2
import argparse
from retinaface import RetinaFace


# Enhanced blurring and pixelation function
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

# Detecting face in image
def process_image(input_image, output_image):
    frame = cv2.imread(input_image)
    detections = RetinaFace.detect_faces(frame)
    
    if detections is not None:
        for face in detections.values():
            facial_area = face["facial_area"]
            x1, y1, x2, y2 = facial_area
            frame = blur_and_pixelate_face_region(frame, (x1, y1, x2, y2))
    
    cv2.imwrite(output_image, frame)


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

# Equalizing a frame (probably not needed)
def enhance_frame(frame):
    # Convert to YUV color space
    yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
    # Apply histogram equalization to the Y channel
    yuv[:,:,0] = cv2.equalizeHist(yuv[:,:,0])
    # Convert back to BGR color space
    enhanced_frame = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
    return enhanced_frame

# Detecting faces in a video
def process_video(input_video, output_video):
    cap = cv2.VideoCapture(input_video)
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    codec = get_codec(output_video)
    out = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*codec), 20.0, (frame_width, frame_height))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Enhance       
        detections = RetinaFace.detect_faces(frame)
        if detections is not None:
            for face in detections.values():
                facial_area = face["facial_area"]
                frame = blur_and_pixelate_face_region(frame, facial_area)
        out.write(frame)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

# Runs the program
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Face blurring in video files and images.')
    parser.add_argument('-m', '--mode', choices=['video', 'image'], help='Mode of operation: process a video or an image.', required=True)
    parser.add_argument('-i', '--input', help='Path to input file (video or image)', required=True)
    parser.add_argument('-o', '--output', help='Path to output file (video or image)', required=True)

    args = parser.parse_args()

    if args.mode == 'video':
        process_video(args.input, args.output)
    elif args.mode == 'image':
        process_image(args.input, args.output)
