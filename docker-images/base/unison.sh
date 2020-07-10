#!/bin/sh

mkdir -p "/tmp/$1"
while true; do
  flock -w 30 /tmp"$1"/unison.lock /usr/local/bin/unison -copythreshold 100000 -owner -group -batch -repeat watch -fastercheckUNSAFE -prefer "$1" "$@" || exit 1
done