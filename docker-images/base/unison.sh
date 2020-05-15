#!/bin/sh

while true; do
  flock /tmp/unison.lock /usr/local/bin/unison -copythreshold 100000 -owner -group -batch -repeat watch -fastercheckUNSAFE -prefer /.x-ce-dev /.x-ce-dev /home/ce-dev/deploy/live.local
done