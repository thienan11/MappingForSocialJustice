import cv2
import argparse
from retinaface import RetinaFace

from get_codec import get_codec_from_file
from blurring_effects import *


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


# Detecting faces in a video
def process_video(input_video, output_video):
    cap = cv2.VideoCapture(input_video)
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    codec = get_codec_from_file(output_video)
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


def retinaface_face_blurring():
    parser = argparse.ArgumentParser(description='Face blurring in video files and images.')
    parser.add_argument('-m', '--mode', choices=['video', 'image'], help='Mode of operation: process a video or an image.', required=True)
    parser.add_argument('-i', '--input', help='Path to input file (video or image)', required=True)
    parser.add_argument('-o', '--output', help='Path to output file (video or image)', required=True)

    args = parser.parse_args()

    if args.mode == 'video':
        process_video(args.input, args.output)
    elif args.mode == 'image':
        process_image(args.input, args.output)

# Runs the program
if __name__ == '__main__':
    retinaface_face_blurring()