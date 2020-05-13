#!/bin/sh

while true; do
  flock /tmp/unison.lock /usr/local/bin/unison -owner -group -batch -ignore "Name vendor" -ignore "Name node_modules" -ignore "Path */sites/*/files" -repeat watch -fastercheckUNSAFE -prefer /.x-ce-dev /.x-ce-dev /home/ce-dev/deploy/live.local
done