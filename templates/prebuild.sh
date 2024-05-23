#!/bin/sh
# Test project creation and pre-build image.
set -e

usage(){
  echo 'prebuild.sh [OPTIONS]'
  echo 'Test the different templates and push the images to docker if it is required'
  echo 'Available options:'
  echo '--template: ce-dev template to use. By default: ce-dev.compose.yml'
  echo '--push: if we want to push the images to docker'
}
# Parse options arguments.
parse_options(){
  while [ "${1:-}" ]; do
    case "$1" in
      "--template")
          shift
          TEMPLATE="$1"
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
PROJECTS="blank drupal10"
PUSH="no"
TEMPLATE="ce-dev.compose.yml"
CE_DEV_BIN="$OWN_DIR/bin/run.js"

# Common processing.
OWN_DIR=$(dirname "$0")
cd "$OWN_DIR" || exit 1
OWN_DIR=$(git rev-parse --show-toplevel)
cd "$OWN_DIR" || exit 1
OWN_DIR=$(pwd -P)
WORK_DIR=$(mktemp -d)

# Parse options.
parse_options "$@"

# Create a project.
# @param $1
# Project name.
create_project(){
  $CE_DEV_BIN create --destination="$WORK_DIR/$1" --project="$1" --template="$1"
  cd "$WORK_DIR/$1"
  $CE_DEV_BIN init  --template="$TEMPLATE"
  $CE_DEV_BIN start
  $CE_DEV_BIN provision
  $CE_DEV_BIN deploy
}

# Test a project.
# @param $1
# Project name.
test_project(){
  cd "$WORK_DIR/$1"
  echo "$1"
}

# Build a project.
# @param $1
# Project name.
build_project(){
  cd "$WORK_DIR/$1"
  $CE_DEV_BIN build --registry codeenigma
}

# Build a project.
# @param $1
# Project name.
push_project(){
  cd "$WORK_DIR/$1"
  $CE_DEV_BIN push --anonymous --registry codeenigma
}

for PROJECT in $PROJECTS; do
 create_project "$PROJECT"
 test_project "$PROJECT"
 build_project "$PROJECT"
 if [ $PUSH = "yes" ]; then
  push_project "$PROJECT"
 fi
done
