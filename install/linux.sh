#!/bin/sh
set -e

RELEASE=https://github.com/codeenigma/ce-dev/releases/download/1.0.16/ce-dev-v1.0.11-linux-x64.tar.gz
WORK_DIR=$(mktemp -d)

cd "$WORK_DIR"
echo "Fetching and unpacking latest release..."
curl -L "$RELEASE" -o ce-dev.tar.gz
tar xvfz ce-dev.tar.gz
echo "Moving binaries to /opt. This requires sudo privileges..."
if [ -d /opt/ce-dev ]; then
  sudo rm -rf /opt/ce-dev
fi
sudo mv "$WORK_DIR/ce-dev" "/opt/"
sudo chmod +x /opt/ce-dev/bin/ce-dev
echo "Creating symlink to /usr/local/bin..."
if [ -f /usr/local/bin/ce-dev ]; then
  sudo rm /usr/local/bin/ce-dev
fi
sudo ln -s /opt/ce-dev/bin/ce-dev /usr/local/bin/ce-dev
