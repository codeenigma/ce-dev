ce-dev
======

Local Stack wrapper tool

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
* [Commands](#commands)
* [Troubleshooting](#troubleshooting)
<!-- tocstop -->
# Commands
<!-- commands -->
* [`ce-dev build`](#ce-dev-build)
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

## `ce-dev build`

Commit the existing containers as new docker images, and create a new docker-compose file referencing them.

```
USAGE
  $ ce-dev build

OPTIONS
  -d, --destination=destination  [default: ce-dev.compose.prebuilt.yml] Path to the output docker-compose file, relative
                                 to the project root.

  -h, --help                     show CLI help

  -t, --template=template        [default: ce-dev.compose.yml] Path to a docker-compose template file, relative to the
                                 project root. WARNING: this must match the original one the project was constructed
                                 with.

EXAMPLE
  $ ce-dev build --template example.compose.yml
```

_See code: [src/commands/build.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/build.ts)_

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

_See code: [src/commands/create.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/create.ts)_

## `ce-dev deploy`

Setu an app with Ansible playbooks.

```
USAGE
  $ ce-dev deploy

EXAMPLE
  $ ce-dev deploy example-app
```

_See code: [src/commands/deploy.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/deploy.ts)_

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

_See code: [src/commands/destroy.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/destroy.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `ce-dev init`

Generates a docker-compose.yml file from a template

```
USAGE
  $ ce-dev init

OPTIONS
  -h, --help               show CLI help

  -t, --template=template  [default: ce-dev.compose.yml] path to a docker-compose template file, relative to the project
                           root

EXAMPLE
  $ ce-dev init --template example.compose.yml
```

_See code: [src/commands/init.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/init.ts)_

## `ce-dev provision`

Provision containers with Ansible playbooks.

```
USAGE
  $ ce-dev provision
```

_See code: [src/commands/provision.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/provision.ts)_

## `ce-dev pull`

Pull images referenced in a compose file from a remote repository.

```
USAGE
  $ ce-dev pull

OPTIONS
  -h, --help               show CLI help

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

EXAMPLE
  $ ce-dev pull --template example.compose.yml
```

_See code: [src/commands/pull.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/pull.ts)_

## `ce-dev push`

Push images referenced in a compose file to a remote repository.

```
USAGE
  $ ce-dev push

OPTIONS
  -h, --help               show CLI help

  -p, --password=password  Password to use to login against the Docker registry. Warning, this will appear in your shell
                           history in clear text.

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

  -u, --username=username  Username to use to login against the Docker registry. For repository that do not require
                           auth, you can enter anything as username/pwd

EXAMPLE
  $ ce-dev push --template example.compose.yml
```

_See code: [src/commands/push.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/push.ts)_

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

_See code: [src/commands/shell.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/shell.ts)_

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

_See code: [src/commands/start.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/start.ts)_

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

_See code: [src/commands/stop.ts](https://github.com/codeenigma/ce-dev/blob/v0.0.0/src/commands/stop.ts)_
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