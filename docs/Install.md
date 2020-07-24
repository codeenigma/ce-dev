# Install

Hardware requirements: while the stack in itself is not necessarily heavy, you will need sufficient resources to run all your projects and diskspace to store them. You'll need at least 8GB of RAM (16GB reccomended) and modern host (SSD, new processor) to run comfortably.
We also assume common utilities are present:
- git
- curl
- gunzip

## Linux
### Requirements
#### Docker
Follow the installation instructions for your distro from https://docs.docker.com/engine/install/. It is generally straightforward, except for users of [Fedora 31 and above](https://duckduckgo.com/?q=docker+fedora+32).

***Shall I `sudo docker` or `docker`?***
Most setup instructions you will find online instruct you to [add your user to the "docker" group](https://docs.docker.com/engine/install/linux-postinstall/) to be able to call docker as a standard user.
There is a [non-neglectable risk](https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface) with that approach, even though it is far more convenient than being prompted for your password each and every step.

By default, ce-dev will assume you went the "safe" way and use `sudo docker` or `sudo docker-compose`, but you can change that in your [global configuration](config).

#### Docker Compose
Follow the installation instruction for your distro from https://docs.docker.com/compose/install/.

#### mkcert
Follow the instructions frow https://github.com/FiloSottile/mkcert#linux and make sure to have nss/certutil installed. On a successful install, running `mkcert install` should output something along the lines of:

```
Using the local CA at "/home/XXX/.local/share/mkcert" ✨
The local CA is already installed in the system trust store! 👍
The local CA is already installed in the Firefox and/or Chrome/Chromium trust store! 👍
```
Make sure to restart your browsers after installing.

#### inotify watcher limit
To leverage the [Unison](https://github.com/bcpierce00/unison) file mounting (see [Mounts](unison) as to why you'd want to use that on Linux at all in the first place), we need to change the default limits for `inotify` watchers.
On most systems, you can check what the current value is with:

```
cat /proc/sys/fs/inotify/max_user_watches
```
and/or 
```
sudo sysctl fs.inotify.max_user_watches
```
The default value is often `8192`, which is far too low. You must change this to a more suitable number, usually `65536`. The location of the `inotify` config is different on different systems, so you'll need to re-search it for your distribution.

The most common method you'll find by Googling usually is along the lines of:
```
echo fs.inotify.max_user_watches=65536 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p # Or better yet, reboot.
```
Nowadays, though, this is slowly being deprecated, and should instead be set through sysctl directly:
```
sysctl -n -w fs.inotify.max_user_watches=65536
sudo sysctl -p # Or better yet, reboot.
```

### Install
To install ce-dev itself, use this one-liner:
```
curl -sL https://raw.githubusercontent.com/codeenigma/ce-dev/1.x/install/linux.sh | /bin/sh
```
*note for the "I don't trust your install script" crowd out there... 1. Just follow the link to see what this script does. 2. If you don't trust the install script, why would you trust the rest of the program in the first place?*

## Mac
### Requirements
#### Docker
Follow the installation instructions from https://docs.docker.com/engine/install/.
#### Docker Compose
Docker Compose is bundled with Docker Desktop already.

#### mkcert
Follow the instructions from https://github.com/FiloSottile/mkcert#macos and triple check nss/certutil installed. On a successful install, running `mkcert install` should output something along the lines of:

```
Using the local CA at "/Users/XXX/.local/share/mkcert" ✨
The local CA is already installed in the system trust store! 👍
The local CA is already installed in the Firefox and/or Chrome/Chromium trust store! 👍
```
Make sure to restart your browsers after installing.

### Install
To install ce-dev itself, use this one-liner:
```
curl -sL https://raw.githubusercontent.com/codeenigma/ce-dev/1.x/install/mac.sh | /bin/sh
```
*note for the “I don’t trust your install script” crowd out there… 1. Just follow the link to see what this script does. 2. If you don’t trust the install script, why would you trust the rest of the program in the first place?*