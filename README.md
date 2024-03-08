# MappingSocialJustice

A Repository for the "Mapping as an Agent for Change: Empowering Social Justice Initiatives" research project.

## Overview

The face_blurring directory contains scripts for applying face blurring to images or videos. There are two models being used, RetinaFace and YOLOv8.

## Requirements

To run a script, you will need Python 3.x and the following dependencies:

- opencv-python
- torch
- ultralytics

These dependencies can be installed through the `requirements.txt` file.

## Installation

Clone the repository or download the files and install the required dependencies by running the following command in your terminal:

```bash
pip install -r requirements.txt
```

## Usage

To use the face blurring scripts, you must specify the input file path, the processing mode (image or video), and the output file path. Here is how you can run the script from the command line:

```bash
python <script_name.py> -m image|video -i "path/to/input/file" -o "path/to/output/file"
```

## Current Implementation

YOLOv8 model currently produces the best results. The script utilizes OpenCV for image and video processing, along with PyTorch and the Ultralytics YOLO package for face detection. Here's a brief overview of its operation:

- For images, it reads the specified file, detects faces using the YOLOv8 model, applies pixelation to each detected face, and saves the result to the specified output file.

- For videos, it processes each frame in the same manner as images, then compiles the frames back into a video file with the original dimensions and frame rate.

- Faces are detected with a low confidence threshold to ensure broad coverage, and a pixelation effect is applied to enhance privacy while maintaining the context of the image or video.

## Need to Work On

- Improving security through better blurring techniques:

  - masking

  - manipulate image pixels randomly

  - do different filtering for different frames (pick the frames randomly)

  - eliminate number of frames to increase the protection of identity of individual without destroying their story (every 3 frame eliminated)

- Get image/video information:

  - Check for detail information that may be hidden in jpg files or mp4 and mov
