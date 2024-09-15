# Mapping For Social Justice Backend

This directory contains the source code required to run the backend for the Mapping For Social Justice archiving platform, built using [Flask](https://flask.palletsprojects.com/en/3.0.x/).

## Requirements

You will need to use Python 3.11.7 or below and certain dependencies, which can be installed through the `requirements.txt` file:
```shell
pip3 install -r requirements.txt
```

- Using a virtual environment is preferred to isolate dependencies. Create one using `python3 -m venv env_name` and run using `source <env_name>/bin/activate`.

## Running

For development, run with `python3 app.py`.

For production, run with `gunicorn --bind 0.0.0.0:<PORT> wsgi:app --workers=3` 
  - `--workers=3`: Configures Gunicorn to use 3 worker processes

## Deployment

This Flask backend is containerized using [Docker](https://www.docker.com/) and deployed on [Google Cloud Run](https://cloud.google.com/run?hl=en). The Docker image is managed and stored in [Google Cloud's Artifact Registry](https://cloud.google.com/artifact-registry).

### Commands

To build the image:
```shell
docker build -t name:latest . 
```

To build the image for deployment on Linux 64-bit platform:

Using buildx (use --load to save image locally):
```shell
docker buildx build --platform linux/amd64 -t "name":latest --load .
```
or without buildx:
```shell
docker build --platform linux/amd64 -t "name":latest .
```

To run it (with -d flag for detached mode):
```shell
docker container run -d -p 4000:4000 "name":latest
```

To stop it (get container_id using `docker container ls`):
```shell
docker container stop <CONTAINER_ID>
```

To remove the container:
```shell
docker container rm <CONTAINER_ID>
```

To check directories in existing docker image:
```shell
docker container run -it <IMAGE_NAME> bash
```

Environment variables can be added when running `docker container run` with the `-e` flag.

### Deploying to Google Cloud Run

1. Make sure to have [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed first.

2. Sign in using `gcloud auth login`, which will open a browser for you to sign in (use `gcloud auth print-access-token` to see your access token).

3. Set a project using `gcloud config set project <PROJECT_ID>`
    - Use `gcloud projects list` to see all your projects in Google Cloud.
    - Use `gcloud config get-value project` to see current set project.

4. Run `gcloud auth configure-docker <HOST-NAME>` to configure gcloud as the credential helper for the Artifact Registry domain associated with your repository's location.

Now your Google Cloud CLI should be set up for uploading the image. 

Tag image so Google Cloud CLI knows where to upload it:
```shell
docker tag <IMAGE_ID> REPO_URL
```

To push to the repository:
```shell
docker push REPO_URL
```

`REPO_URL` is in the form of `HOST-NAME/PROJECT-ID/REPOSITORY/IMAGE`

NOTE: for more command options use `gcloud config --help`

## Resources
These are some resources that helped in debugging some issues.

- https://stackoverflow.com/questions/55662222/container-failed-to-start-failed-to-start-and-then-listen-on-the-port-defined-b

- https://stackoverflow.com/questions/66127933/cloud-run-failed-to-start-and-then-listen-on-the-port-defined-by-the-port-envi

- https://stackoverflow.com/questions/43925487/how-to-run-gunicorn-on-docker