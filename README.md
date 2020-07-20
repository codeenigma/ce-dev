ce-dev
======
Local Stack wrapper tool

[![Build Status](https://api.travis-ci.com/codeenigma/ce-dev.svg?branch=1.x)](https://api.travis-ci.com/codeenigma/ce-dev.svg?branch=1.x)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=security_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=bugs)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=alert_status)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)

***WARNING: WIP - Future changes won't be backward compatible***

# Requirements
You'll need docker-compose (and docker) on a Mac or Linux host.

# Install
- Download the latest release from your platform at https://github.com/codeenigma/ce-dev/releases
- Extract where convenient (eg /opt or your $HOME)
- Add ce-dev/bin/ce-dev to your $PATH in your .bashrc/.zshrc or symlink it to /usr/local/bin.


<!-- toc -->
* [Requirements](#requirements)
* [Install](#install)
* [Quickstart](#quickstart)
* [Commands](#commands)
* [Troubleshooting](#troubleshooting)
<!-- tocstop -->

# Quickstart

If you are using a project already set up for using `ce-dev` just `cd` into the `ce-dev` directory in your project and run these commands:

* [`ce-dev init`](#ce-dev-init) (prepares the containers)
* [`ce-dev start`](#ce-dev-start) (starts up the containers)
* [`ce-dev provision`](#ce-dev-provision) (installs software required on the containers)
* [`ce-dev deploy`](#ce-dev-deploy) (installs your application on the containers)

Your containers should now be up and running and your application available in a browser. Check `/etc/hosts` to see where your web server is, if you're not sure. To start and stop your containers:

* [`ce-dev start`](#ce-dev-start)
* [`ce-dev stop`](#ce-dev-stop)

To tear it all down and start again:

* [`ce-dev destroy`](#ce-dev-destroy)

# Commands
<!-- commands -->
* [`ce-dev autocomplete [SHELL]`](#ce-dev-autocomplete-shell)
* [`ce-dev browse`](#ce-dev-browse)
* [`ce-dev build`](#ce-dev-build)
* [`ce-dev config`](#ce-dev-config)
* [`ce-dev create`](#ce-dev-create)
* [`ce-dev deploy`](#ce-dev-deploy)
* [`ce-dev destroy`](#ce-dev-destroy)
* [`ce-dev help [COMMAND]`](#ce-dev-help-command)
* [`ce-dev init`](#ce-dev-init)
* [`ce-dev provision`](#ce-dev-provision)
* [`ce-dev pull`](#ce-dev-pull)
* [`ce-dev push`](#ce-dev-push)
* [`ce-dev shell [CONTAINER]`](#ce-dev-shell-container)
* [`ce-dev start`](#ce-dev-start)
* [`ce-dev stop`](#ce-dev-stop)

## `ce-dev autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ ce-dev autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ ce-dev autocomplete
  $ ce-dev autocomplete bash
  $ ce-dev autocomplete zsh
  $ ce-dev autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.2.0/src/commands/autocomplete/index.ts)_

## `ce-dev browse`

Open preset URL(s) in a browser

```
USAGE
  $ ce-dev browse

EXAMPLE
  $ ce-dev browse
```

_See code: [src/commands/browse.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/browse.ts)_

## `ce-dev build`

Commit the existing containers as new docker images, and create a new docker-compose file referencing them.

```
USAGE
  $ ce-dev build

OPTIONS
  -d, --destination=destination  [default: ce-dev.compose.prebuilt.yml] Path to the output docker-compose file, relative
                                 to the project ce-dev folder.

  -h, --help                     show CLI help

  -t, --template=template        [default: ce-dev.compose.yml] Path to a docker-compose template file, relative to the
                                 project ce-dev folder. WARNING: this must match the original one the project was
                                 constructed with.

EXAMPLE
  $ ce-dev build --template example.compose.yml
```

_See code: [src/commands/build.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/build.ts)_

## `ce-dev config`

Configure global user preferences.

```
USAGE
  $ ce-dev config

OPTIONS
  -g, --global  Update global config instead of project one

EXAMPLE
  $ ce-dev config
```

_See code: [src/commands/config.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/config.ts)_

## `ce-dev create`

Generates a new project from a template

```
USAGE
  $ ce-dev create

OPTIONS
  -d, --destination=destination  Path to the project destination.
  -h, --help                     show CLI help

  -p, --project=project          A unique name for your project. Because it is used in various places (db names, url,
                                 etc), stick with lowercase alphanumeric chars.

  -t, --template=template        Name of a template: "drupal8"

EXAMPLE
  $ ce-dev create --template drupal8 --project myproject
```

_See code: [src/commands/create.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/create.ts)_

## `ce-dev deploy`

Setup an app with Ansible playbooks.

```
USAGE
  $ ce-dev deploy

EXAMPLE
  $ ce-dev deploy example-app
```

_See code: [src/commands/deploy.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/deploy.ts)_

## `ce-dev destroy`

Destroy project's containers using docker-compose kill.

```
USAGE
  $ ce-dev destroy

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ ce-dev destroy
```

_See code: [src/commands/destroy.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/destroy.ts)_

## `ce-dev help [COMMAND]`

display help for ce-dev

```
USAGE
  $ ce-dev help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `ce-dev init`

Generates a docker-compose.yml file from a template

```
USAGE
  $ ce-dev init

OPTIONS
  -h, --help               show CLI help

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] path to a docker-compose template file, relative to
                           the project root

EXAMPLE
  $ ce-dev init --template example.compose.yml
```

_See code: [src/commands/init.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/init.ts)_

## `ce-dev provision`

Provision containers with Ansible playbooks.

```
USAGE
  $ ce-dev provision
```

_See code: [src/commands/provision.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/provision.ts)_

## `ce-dev pull`

Pull images referenced in a compose file from a remote repository.

```
USAGE
  $ ce-dev pull

OPTIONS
  -a, --anonymous          Do not prompt for login credentials.
  -h, --help               show CLI help

  -p, --password=password  Password to use to login against the Docker registry. Warning, this will appear in your shell
                           history in clear text.

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

  -u, --username=username  Username to use to login against the Docker registry.

EXAMPLE
  $ ce-dev pull --template example.compose.yml
```

_See code: [src/commands/pull.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/pull.ts)_

## `ce-dev push`

Push images referenced in a compose file to a remote repository.

```
USAGE
  $ ce-dev push

OPTIONS
  -a, --anonymous          Do not prompt for login credentials.
  -h, --help               show CLI help

  -p, --password=password  Password to use to login against the Docker registry. Warning, this will appear in your shell
                           history in clear text.

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

  -u, --username=username  Username to use to login against the Docker registry.

EXAMPLE
  $ ce-dev push --template example.compose.yml
```

_See code: [src/commands/push.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/push.ts)_

## `ce-dev shell [CONTAINER]`

Open a shell session on the given container.

```
USAGE
  $ ce-dev shell [CONTAINER]

ARGUMENTS
  CONTAINER  Name of the container to target. Use `docker ps` to see available containers.

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ ce-dev shell example-app
```

_See code: [src/commands/shell.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/shell.ts)_

## `ce-dev start`

Spin up containers using docker-compose and update /etc/hosts file.

```
USAGE
  $ ce-dev start

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ ce-dev start
```

_See code: [src/commands/start.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/start.ts)_

## `ce-dev stop`

Stops running containers for a project.

```
USAGE
  $ ce-dev stop

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ ce-dev stop
```

_See code: [src/commands/stop.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.11/src/commands/stop.ts)_
<!-- commandsstop -->

# Troubleshooting

## SSH Issues
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

## File permissions
Sometimes, particularly on Macs, we have seen permissions issues on the `/home/ce-dev` directory in the web container. If this occurs, use `ce-dev shell` to access the container and `sudo chown -R ce-dev:ce-dev /home/ce-dev`. You may need to do this again if you destroy and reprovision your containers.

## Files not updating in the container
### inotify watcher limit
If your files are not updating you should check the maximum permitted `inotify` watchers. On most systems it will be a command like this:

* `cat /proc/sys/fs/inotify/max_user_watches`

The default value is often `8192`, which can be too low for modern applications with a Git repository and lots of dependencies being pulled in by a package manager. You can change this to a more suitable number, usually `65536` is sufficient. The location of the `inotify` config is different on different systems, here is an Ubuntu guide

* https://dev.to/rubiin/ubuntu-increase-inotify-watcher-file-watch-limit-kf4

### Editor does not update file inumber
The some editors behave on save means the inumber of the file does not change, so unison does not pick up a difference and the files in your containers do not update. Notable culprits are `vim` and `Atom`. In both cases there are fixes - for example the `local-history` plugin for `Atom` forces it to behave as we need. If you have mysterious issues with files not changing in your containers and it isn't the `inotify` watcher limit above, check how your editor behaves.
