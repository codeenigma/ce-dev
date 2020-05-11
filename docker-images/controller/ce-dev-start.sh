#!/bin/sh

# @file
# Controller startup script.

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

# Generate ssh key pair.
ensure_ssh_key(){
  rm -rf /home/ce-dev/.ssh/*
  ssh-keygen -t rsa -b 4096 -N "" -f /home/ce-dev/.ssh/id_rsa
  cp /home/ce-dev/.ssh/id_rsa.pub /home/ce-dev/.ssh/authorized_keys
  chmod 600 /home/ce-dev/.ssh/id_rsa
  chmod 600 /home/ce-dev/.ssh/id_rsa.pub
  chmod 600 /home/ce-dev/.ssh/authorized_keys
  chown -R ce-dev:ce-dev /home/ce-dev/.ssh
}

# We only change ids > 1000 (either we're root 0, on a mac 501 or already 1000).
if [ -n "$1" ] && [ -n "$2" ]; then 
  if [ "$1" -gt 1000 ] || [ "$2" -gt 1000 ]; then
    ensure_user_ids "$1" "$2"
  fi
fi

if [ -e /run/sshd.pid ]; then
  rm /run/sshd.pid
fi
/usr/sbin/sshd -D