#!/bin/sh

# Ensure user numeric uid/gid matches.
# @param $1
# User id.
# @param $2
# Group id.
ensure_user_ids(){
  OLD_UID="$(id -u ce-dev)"
  OLD_GID="$(id -g ce-dev)"
  if [ "$OLD_UID" != "$1" ]; then
    usermod -u "$1" ce-dev
    chown -R --from="$OLD_UID" "$NEW_UID" /var
    chown -R "$NEW_UID" /.x-ce-dev
    chown -R "$NEW_UID" /home/ce-dev
    echo "User ID changed to $1."
  fi
  if [ "$OLD_GID" != "$2" ]; then
    groupmod -g "$2" ce-dev
    chown -R --from=":$OLD_GID" ":$NEW_GID" /var
    chown -R ":$NEW_GID" /.x-ce-dev
    chown -R ":$NEW_GID" /home/ce-dev
    echo "Group ID changed to $2."
    OWN_CHANGED=1
  fi
}

# Match ids with host user.
if [ -n "$1" ] && [ -n "$2" ]; then 
    ensure_user_ids "$1" "$2"
fi