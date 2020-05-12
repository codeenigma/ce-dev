#!/bin/sh

# Ensure user numeric uid/gid matches.
# @param $1
# User id.
# @param $2
# Group id.
ensure_user_ids(){
  # Check if change is needed.
  OWN_CHANGED=0
  if [ "$(id -u ce-dev)" != "$1" ]; then
    usermod -u "$1" ce-dev
    echo "User ID changed to $1."
    OWN_CHANGED=1
  fi
  if [ "$(id -g ce-dev)" != "$2" ]; then
    groupmod -g "$2" ce-dev
    echo "Group ID changed to $2."
    OWN_CHANGED=1
  fi
  if [ "$OWN_CHANGED" -eq 1 ]; then
    chown -R ce-dev:ce-dev /home/ce-dev
  fi
}

# Match ids with host user.
if [ -n "$1" ] && [ -n "$2" ]; then 
    ensure_user_ids "$1" "$2"
fi