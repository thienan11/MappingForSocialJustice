# Flask Backend

## Deployment using Docker

Currently, this flask backend is being dockerized and deployed on Google Cloud Run. The docker image is stored in Google Cloud's Artifact Registry.

### Commands

To build the image:
```shell
docker build -t name:latest . 
```

To build the image for deployment on Linux 64-bit platform:
Using buildx
```shell
docker buildx build --platform linux/amd64 -t "name":latest --load .
```
or without buildx
```shell
docker build --platform linux/amd64 -t "name":latest .
```

To run it (with -d flag for detached mode):
```shell
docker container run -d -p 4000:4000 "name":latest
```

To stop it (get container_id using `docker container ls`):
```shell
docker container stop <container_id>
```

To remove the container:
```shell
docker container rm <container_id>
```

To check directories in existing docker image:
```shell
docker container run -it <image_name> bash
```

Environment variables can be added when running `docker container run` with the `-e` flag.

## Resources
These are some resources that helped in debugging some issues.

- https://stackoverflow.com/questions/55662222/container-failed-to-start-failed-to-start-and-then-listen-on-the-port-defined-b

- https://stackoverflow.com/questions/66127933/cloud-run-failed-to-start-and-then-listen-on-the-port-defined-by-the-port-envi

- https://stackoverflow.com/questions/43925487/how-to-run-gunicorn-on-docker