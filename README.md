ce-dev
======
Local Stack wrapper tool

[![Build Status](https://api.travis-ci.com/codeenigma/ce-dev.svg?branch=1.x)](https://api.travis-ci.com/codeenigma/ce-dev.svg?branch=1.x)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=security_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=bugs)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=alert_status)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)

A local stack based on Docker Compose and Ansible. It aims to be easy to use but also stay flexible and powerful by not hiding complexity behind yet another abstraction layer.

# Key features
- Allows several projects (or the host) to re-use the same ports
- Allows mixing any Docker images with ce-dev specific ones
- HTTPS support through [mkcert](https://github.com/FiloSottile/mkcert)
- Built-in Unison sync to avoid bind mount slowness on Mac OS
- Easily build and push ready made images from running containers for you project
- Only defines a few simple commands, and defers to docker-compose and Ansible beyond that

# Install
## Linux
## Mac
# Quickstart
# Overview
# Commands
<!-- commands -->
<!-- commandsstop -->
# Troubleshooting

# SSH Issues
Containers are normally autoconfigured to allow the 'ce-dev' user to SSH to each others. In case something went wrong, you can re-generate the keys.
1. Delete the existing keys
```
(sudo) docker exec -it ce_dev_controller /bin/bash
rm -rf /home/ce-dev/.ssh/*
exit
```
2. Restart the containers to recreate it.
```
(sudo) docker stop ce_dev_controller
ce-dev start
```

# File permissions
Sometimes, particularly on Macs, we have seen permissions issues on the `/home/ce-dev` directory in the web container. If this occurs, use `ce-dev shell` to access the container and `sudo chown -R ce-dev:ce-dev /home/ce-dev`. You may need to do this again if you destroy and reprovision your containers.

# Files not updating in the container
## inotify watcher limit
If your files are not updating you should check the maximum permitted `inotify` watchers. On most systems it will be a command like this:

* `cat /proc/sys/fs/inotify/max_user_watches`

The default value is often `8192`, which can be too low for modern applications with a Git repository and lots of dependencies being pulled in by a package manager. You can change this to a more suitable number, usually `65536` is sufficient. The location of the `inotify` config is different on different systems, here is an Ubuntu guide

* https://dev.to/rubiin/ubuntu-increase-inotify-watcher-file-watch-limit-kf4

## Editor does not update file inumber
The some editors behave on save means the inumber of the file does not change, so unison does not pick up a difference and the files in your containers do not update. Notable culprits are `vim` and `Atom`. In both cases there are fixes - for example the `local-history` plugin for `Atom` forces it to behave as we need. If you have mysterious issues with files not changing in your containers and it isn't the `inotify` watcher limit above, check how your editor behaves.
