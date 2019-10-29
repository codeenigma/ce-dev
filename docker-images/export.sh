#!/bin/sh
#
# (Re)build a Docker base box for ce-dev.
#

usage(){
  cat << EOF
usage:

Export a base CodeEnigma image, optionally pushing it do Docker Hub.
$0 <versiontag> [--push]

EOF
}

# Quick check we have args.
if [ -z "$1" ]; then
  usage
  exit 1;
fi

# Keep current dir in mind to know where to move back when done.
OWN=$(readlink "$0");
if [ -z "$OWN" ]; then
 OWN="$0"
fi
OWN_DIR=$( cd "$( dirname "$OWN" )" && pwd -P)

# Ensure we have a fresh image to start with.
docker image pull debian:buster

# Build base image.
echo "1. Building the image"
docker image build --compress "--label=ce-dev:$1" --no-cache=true -t "codeenigma/ce-dev:$1" "$OWN_DIR/base" || exit 1
echo "The 'Docker' extenPublishing the image with docker image push codeenigma/ce-dev:$1"
if [ "$2" = "--push" ]; then
  docker image push "codeenigma/ce-dev:$1"
fi

# Build controller image.
echo "1. Building the image"
docker image build --compress "--label=ce-dev-controller:$1" --no-cache=true -t "codeenigma/ce-dev-controller:$1" "$OWN_DIR/controller" --build-arg "versionTag=$1" || exit 1
echo "Publishing the image with docker image push codeenigma/ce-dev-controller:$1"
if [ "$2" = "--push" ]; then
  docker image push "codeenigma/ce-dev-controller:$1"
fi

# Build docker image.
echo "1. Building the image"
docker image build --compress "--label=ce-dev-dind:$1" --no-cache=true -t "codeenigma/ce-dev-dind:$1" "$OWN_DIR/dind" --build-arg "versionTag=$1" || exit 1
echo "Publishing the image with docker image push codeenigma/ce-dev-controller:$1"
if [ "$2" = "--push" ]; then
  docker image push "codeenigma/ce-dev-dind:$1"
fi