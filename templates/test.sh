#!/bin/sh
# Test project creation and pre-build image.
set -e
PROJECTS="blank drupal8"

# Common processing.
OWN_DIR=$(dirname "$0")
cd "$OWN_DIR" || exit 1
OWN_DIR=$(git rev-parse --show-toplevel)
cd "$OWN_DIR" || exit 1
OWN_DIR=$(pwd -P)

# ce-dev "binary"
CE_DEV_BIN="$OWN_DIR/bin/run"

# Create a project.
# @param $1
# Project name.
create_project(){
  cd
  $CE_DEV_BIN create --destination="$(pwd)/$1" --project="$1" --template="$1"
  cd "$1"
  $CE_DEV_BIN init
  $CE_DEV_BIN start
  $CE_DEV_BIN provision
  $CE_DEV_BIN deploy
}

# Test a project.
# @param $1
# Project name.
test_project(){
  cd
  cd "$1"
  echo "$1"
}

# Build a project.
# @param $1
# Project name.
build_project(){
  cd
  cd "$1"
  $CE_DEV_BIN build --registry codeenigma
}

# Build a project.
# @param $1
# Project name.
push_project(){
  cdecho
  cd "$1"
  $CE_DEV_BIN push --registry codeenigma
}

for PROJECT in $PROJECTS; do
 create_project "$PROJECT"
 test_project "$PROJECT"
 build_project "$PROJECT"
 if [ -n "$1" ] && [ "$1" = "--push" ]; then
  push_project "$PROJECT"
 fi
done