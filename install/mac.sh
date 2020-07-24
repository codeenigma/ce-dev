#!/bin/sh
set -e

RELEASE=https://github.com/codeenigma/ce-dev/releases/download/1.0.16/ce-dev-v1.0.11-darwin-x64.tar.gz
WORK_DIR=$(mktemp -d)

echo "Checking for dependencies..."
for BINARY in docker docker-compose mkcert; do
  if [ -z "$(which "$BINARY")" ]; then
    echo "Could not find $BINARY"
    echo "Ensure it is installed and in your \$PATH"
    exit 1
  fi
done

cd "$WORK_DIR"
echo "Fetching latest release..."
curl -L "$RELEASE" -o ce-dev.tar.gz
echo "Unpacking..."
tar xfz ce-dev.tar.gz
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

echo "All done."