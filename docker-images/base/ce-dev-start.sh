#!/bin/bash

# @file
# Base startup script.

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

# Do nothing if we have no arguments, or we're called with root ids.
if [ -n "$1" ] || [ -n "$2" ] || [ "$1" -lt 1 ] || [ "$1" -lt 1 ]; then
  ensure_user_ids "$1" "$2"
fi

if [ -e /run/sshd.pid ]; then
  rm /run/sshd.pid
fi
/usr/sbin/sshd -D