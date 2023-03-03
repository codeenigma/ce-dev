#!/bin/sh

# Ensure user numeric uid/gid matches.
# @param $1
# User id.
# @param $2
# Group id.
ensure_user_ids(){
  OLD_UID="$(id -u ce-dev)"
  OLD_GID="$(id -g ce-dev)"
  if [ "$OLD_UID" = "$1" ] && [ "$OLD_GID" = "$2" ]; then
    return
  fi
  if [ "$OLD_UID" != "$1" ]; then
    echo "Usermod $1."
    sudo usermod -u "$1" ce-dev
    echo "Chown $1."
    sudo chown -R --from="$OLD_UID" "$1" /var
    echo "User ID changed to $1."
  fi
  if [ "$OLD_GID" != "$2" ]; then
    echo "Groupmod $2."
    sudo groupmod -g "$2" ce-dev
    echo "Chown $2."
    sudo chown -R --from=":$OLD_GID" ":$2" /var
    echo "Group ID changed to $2."
  fi
  if [ -d /.x-ce-dev ]; then
    echo "Chown ce-dev x"
      sudo chown -R ce-dev:ce-dev /.x-ce-dev
  fi
  echo "Chown ce-dev home"
  sudo chown -R ce-dev:ce-dev /home/ce-dev
}

# Match ids with host user.
if [ -n "$1" ] && [ -n "$2" ]; then
    ensure_user_ids "$1" "$2"
fi
