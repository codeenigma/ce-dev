#!/bin/sh

# Generate ssh key pair.
ensure_ssh_key(){
  rm -rf /home/ce-dev/.ssh/*
  ssh-keygen -t rsa -b 4096 -N "" -f /home/ce-dev/.ssh/id_rsa
  cp /home/ce-dev/.ssh/id_rsa.pub /home/ce-dev/.ssh/authorized_keys
  touch /home/ce-dev/.ssh/config
  chmod 600 /home/ce-dev/.ssh/id_rsa
  chmod 600 /home/ce-dev/.ssh/id_rsa.pub
  chmod 600 /home/ce-dev/.ssh/authorized_keys
  chown -R ce-dev:ce-dev /home/ce-dev/.ssh
}

ensure_ssh_key