# Use an official Python runtime as a base image
FROM python:3.11-slim

# Install required system dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libhdf5-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the current directory (backend) contents into the container at /app
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expose the port that Flask runs on
EXPOSE 4000

# Command to run the app in development mode
CMD ["python", "app.py"]

# Run the app in production mode using Gunicorn
# CMD ["gunicorn", "--bind", "0.0.0.0:4000", "wsgi:app", "--workers=3"]
