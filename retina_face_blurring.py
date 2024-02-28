import cv2
import argparse
from retinaface import RetinaFace

def blur_face_region(frame, facial_area):
    x, y, w, h = facial_area
    # Extract face region
    face_region = frame[y:h, x:w]
    # Apply Gaussian Blur to the face region
    blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
    # Replace original face region with blurred one
    frame[y:h, x:w] = blurred_face
    return frame

def main(input_video, output_video):
    cap = cv2.VideoCapture(input_video)
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    out = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*'MP4V'), 20.0, (frame_width, frame_height))

    while True:
        try:
            ret, frame = cap.read()
            
            if not ret:
                print("No more frames read, breaking the loop.")
                break
                
            # frame is successfully read, start detecting faces in frame
            detections = RetinaFace.detect_faces(frame, conf=0.05) # gets a dictionary of detected faces & coordinates

            if detections is not None:
                for face in detections.values():
                    facial_area = face["facial_area"]
                    x1, y1, x2, y2 = facial_area
                    frame = blur_face_region(frame, (x1, y1, x2, y2))

            out.write(frame)
        
        except Exception as e:
            print(f"Error processing frame: {e}")
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Face blurring in video files.')
    # Add arguments with short flags
    parser.add_argument('-i', help='Path to input video file', required=True)
    parser.add_argument('-o', help='Path to output video file', required=True)


    args = parser.parse_args()

    main(args.i, args.o)
