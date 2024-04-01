#!/bin/sh
#
# (Re)build a Docker base box for ce-dev.
#

usage(){
  echo 'export.sh [OPTIONS] --version <version tag> --image-name <final image name> --push'
  echo 'Export a base Code Enigma image, optionally pushing it to your Docker repository.'
  echo ''
  echo 'Mandatory arguments:'
  echo '--version: Version tag to apply to the Docker image, e.g. "latest".'
  echo '--image-name: Name of the resulting Docker image, e.g. "ce-dev".'
  echo ''
  echo 'Available options:'
  echo '--push: Push the built image to the Docker repository.'
  echo '--base-image: Name of the base image to use, IMPORTANT: must match your Dockerfile - defaults to "debian:bullseye-slim".'
  echo '--dockerfile-path: Pass the path within docker-images to your Dockerfile and other build assets - defaults to "base".'
  echo '--docker-repo: Pass the Docker repository name - defaults to "codeenigma".'
  echo '--ce-dev-version: The version to append to the image name - defaults to "1.x".'
}

# Parse options arguments.
parse_options(){
  while [ "${1:-}" ]; do
    case "$1" in
      "--version")
          shift
          VERSION="$1"
        ;;
      "--image-name")
          shift
          IMAGE_NAME="$1"
        ;;
      "--dockerfile-path")
          shift
          DOCKERFILE_PATH="$1"
        ;;
      "--dockerfile-repo")
          shift
          DOCKER_REPO="$1"
        ;;
      "--base-image")
          shift
          BASE_IMAGE="$1"
        ;;
      "--ce-dev-version")
          shift
          CE_DEV_VERSION="$1"
        ;;
      "--push")
          PUSH="yes"
        ;;
        *)
        usage
        exit 1
        ;;
    esac
    shift
  done
}

# Default variables.
DOCKERFILE_PATH="base"
PUSH="no"
BASE_IMAGE="debian:bullseye-slim"
DOCKER_REPO="codeenigma"
CE_DEV_VERSION="1.x"
VERSION=""
IMAGE_NAME=""

# Keep current dir in mind to know where to move back when done.
OWN=$(readlink "$0")
if [ -z "$OWN" ]; then
 OWN="$0"
fi
OWN_DIR=$( cd "$( dirname "$OWN" )" && pwd -P)

# Parse options.
parse_options "$@"

# Check we have enough arguments.
if [ -z "$VERSION" ] || [ -z "$IMAGE_NAME" ]; then
 usage
 exit 1
fi

# Ensure we have a fresh image to start with.
docker image pull "$BASE_IMAGE"

# Build image.
echo "Building $DOCKERFILE_PATH image."
docker image build --compress "--label=$IMAGE_NAME-$CE_DEV_VERSION:$VERSION" --no-cache=true -t "$DOCKER_REPO/$IMAGE_NAME-$CE_DEV_VERSION:$VERSION" "$OWN_DIR/$DOCKERFILE_PATH" || exit 1
if [ $PUSH = "yes" ]; then
  echo "Publishing the image with docker image push $DOCKER_REPO/$IMAGE_NAME-$CE_DEV_VERSION:$VERSION"
  docker image push "$DOCKER_REPO/$IMAGE_NAME-$CE_DEV_VERSION:$VERSION"
fi

