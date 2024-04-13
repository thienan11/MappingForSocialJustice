# Mapping for Social Justice - Face Blurring

A repository for the face blurring functionality of the "Mapping as an Agent for Change: Empowering Social Justice Initiatives" research project.

## Overview

This phase of the project concentrates on enhancing the security of images and videos by implementing protective face blurring. This functionality will ultimately be integrated and automated within the video archiving platform, ensuring that face blurring is applied to every uploaded image or video.

The face_blurring directory contains scripts for applying face blurring to images or videos. There are two models being used, RetinaFace and YOLOv8.

## Requirements

To run a script, you will need Python 3.x and certain dependencies, which can be installed through the `requirements.txt` file.

## Installation

1. Clone the repository or download the files to your local machine. 
2. Navigate to the project directory.
3. Before moving on, it's recommended to create a virtual environment for the project to isolate its dependencies. This can be done through a library like [virtualenv](https://pypi.org/project/virtualenv/) or simply running `python3 -m venv env_name` in your terminal. Make sure to activate it after creating it.
4. Locate `requirements.txt` file, which lists the dependencies needed for the project.
5. To install the required dependencies, run the following command in your terminal:

```bash
pip3 install -r requirements.txt
``` 

## Usage

To use the face blurring scripts (`yolo_blurring.py` or `retina_face_blurring.py`), you must specify the input file path, the processing mode (image or video), and the output file path. Here is how you can run the script from the command line:

```bash
python <script_name.py> -m image|video -i "path/to/input/file" -o "path/to/output/file"
```

## Current Implementation for Face Blurring

Currently exploring two models, [RetinaFace](https://github.com/serengil/retinaface?tab=readme-ov-file) and [YOLO](https://github.com/ultralytics/ultralytics) (particularly YOLOv8).

YOLOv8 model currently produces the best results (fast & lightweight too). The script utilizes OpenCV for image and video processing, along with PyTorch and the Ultralytics YOLO package for face detection. Here's a brief overview of its operation:

- For images, it reads the specified file, detects faces using the YOLOv8 model, applies pixelation to each detected face, and saves the result to the specified output file.

- For videos, it processes each frame in the same manner as images, then compiles the frames back into a video file with the original dimensions and frame rate.

- Faces are detected with a low confidence threshold to ensure that low quality, hard to see faces are detected. Two pixelation effects are being tested (normal pixelation & randomized pixelation in face region). The goal is to enhance privacy while maintaining the context of the image or video.

Documentation for YOLOv8 can be found here: https://docs.ultralytics.com/modes/predict/

## TODO

- Improving security through better blurring techniques:

  - [ ] masking

  - [x] manipulate image pixels randomly

  - [ ] do different filtering for different frames (pick the frames randomly)

  - [x] eliminate number of frames to increase the protection of identity of individual without destroying their story (every 3 frame eliminated)

  - [ ] Investigate algorithm to make blurring irreversible and apply it

- [ ] Explore which YOLO models is the best

- [x] Refactoring code structure

- [ ] Automate face blurring of images/videos