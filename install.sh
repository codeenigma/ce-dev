#!/bin/sh
set -e

usage(){
  echo 'install.sh linux|darwin|windows [OPTIONS]'
  echo 'Install the latest ce-dev version, or the version specified as option'
  echo 'Mandatory arguments:'
  echo '--platform: linux, darwin(MacOS) or windows'
  echo 'Available options:'
  echo '--version: ce-dev version to use.'
}

# Parse options arguments.
parse_options(){
  while [ "${1:-}" ]; do
    case "$1" in
      "--version")
          shift
          VERSION="$1"
        ;;
      "--platform")
          shift
          PLATFORM="$1"
        ;;
        *)
        usage
        exit 1
        ;;
    esac
    shift
  done
}

# Parse options.
parse_options "$@"

# Platform is mandatory.
if [ -z "$PLATFORM" ]; then
  echo "You have to specify the platform"
  usage
  exit 1
fi

# Version is optional.
if [ -z "$VERSION" ]; then
  VERSION=$( curl --silent "https://api.github.com/repos/codeenigma/ce-dev/releases/latest" | grep tag_name | cut -d \" -f 4)
fi

RELEASE=https://github.com/codeenigma/ce-dev/releases/download/$VERSION/ce-dev-v$VERSION-$PLATFORM-x64.tar.gz
WORK_DIR=$(mktemp -d)

# Check if we are updating instead of installing.
if [ -n "$(which ce-dev)" ]; then
  CURRENT=$(ce-dev --version | cut -d / -f 2 | cut -d " " -f 1)
  if [ "$CURRENT" = "$VERSION" ]; then
    echo "Already using the version $VERSION"
    exit 0
  fi
fi
echo "Checking for dependencies..."
for BINARY in docker mkcert; do
  if [ -z "$(which "$BINARY")" ]; then
    echo "Could not find $BINARY"
    echo "Ensure it is installed and in your \$PATH"
    exit 1
  fi
done
echo "done."

cd "$WORK_DIR"
echo "Fetching latest release... $RELEASE"
curl --fail -L "$RELEASE" -o ce-dev.tar.gz
echo "done."

echo "Unpacking..."
tar xfz ce-dev.tar.gz
echo "done."

echo "Moving binaries to /opt. This requires sudo privileges..."
if [ -d /opt/ce-dev ]; then
  sudo rm -rf /opt/ce-dev
fi
sudo mv "$WORK_DIR/ce-dev" "/opt/"
sudo chmod +x /opt/ce-dev/bin/ce-dev
echo "done."

echo "Creating symlink to /usr/local/bin..."
if [ -f /usr/local/bin/ce-dev ]; then
  sudo rm /usr/local/bin/ce-dev
fi
sudo ln -s /opt/ce-dev/bin/ce-dev /usr/local/bin/ce-dev
echo "done."

echo "Killing deprecated running ce_dev_controller container..."
if [ "$(docker ps -q -f name=ce_dev_controller)" ]; then
    if [ "$(docker ps -aq -f status=running -f name=ce_dev_controller)" ]; then
        # cleanup
        docker kill ce_dev_controller
    fi
fi
echo "done."

echo
echo "All done."
