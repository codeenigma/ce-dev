#!/bin/sh
set -e

LATEST=$( curl --silent "https://api.github.com/repos/codeenigma/ce-dev/releases/latest" | grep tag_name | cut -d \" -f 4)
PLATFORM="$1"
RELEASE=https://github.com/codeenigma/ce-dev/releases/download/$LATEST/ce-dev-v$LATEST-$PLATFORM-x64.tar.gz
WORK_DIR=$(mktemp -d)
# Check if we are updating instead of installing.
if [ -n "$(which ce-dev)" ]; then
  VERSION=$(ce-dev --version | cut -d / -f 2 | cut -d " " -f 1)
  if [ "$VERSION" = "$LATEST" ]; then
    echo "Already using latest version $VERSION"
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
