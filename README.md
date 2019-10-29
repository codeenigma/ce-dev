ce-dev
======

Local Stack wrapper tool

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ce-dev.svg)](https://npmjs.org/package/ce-dev)
[![CircleCI](https://circleci.com/gh/pm98zz-c/ce-dev/tree/master.svg?style=shield)](https://circleci.com/gh/pm98zz-c/ce-dev/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/ce-dev.svg)](https://npmjs.org/package/ce-dev)
[![License](https://img.shields.io/npm/l/ce-dev.svg)](https://github.com/pm98zz-c/ce-dev/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ce-dev
$ ce-dev COMMAND
running command...
$ ce-dev (-v|--version|version)
ce-dev/0.0.0 linux-x64 node-v8.14.1
$ ce-dev --help [COMMAND]
USAGE
  $ ce-dev COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ce-dev build`](#ce-dev-build)
* [`ce-dev help [COMMAND]`](#ce-dev-help-command)
* [`ce-dev init`](#ce-dev-init)
* [`ce-dev provision [CONTAINER]`](#ce-dev-provision-container)
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

_See code: [src/commands/build.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/build.ts)_

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

_See code: [src/commands/init.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/init.ts)_

## `ce-dev provision [CONTAINER]`

Provision containers with Ansible playbooks.

```
USAGE
  $ ce-dev provision [CONTAINER]

ARGUMENTS
  CONTAINER  Name of the container to target. Use `docker ps` to see available containers.

OPTIONS
  -a, --all   Provision all containers
  -h, --help  show CLI help

EXAMPLE
  $ ce-dev provision example-app
```

_See code: [src/commands/provision.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/provision.ts)_

## `ce-dev pull`

Push images referenced in a compose file from a remote repository.

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

_See code: [src/commands/pull.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/pull.ts)_

## `ce-dev push`

Push images referenced in a compose file to a remote repository.

```
USAGE
  $ ce-dev push

OPTIONS
  -h, --help               show CLI help

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

EXAMPLE
  $ ce-dev push --template example.compose.yml
```

_See code: [src/commands/push.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/push.ts)_

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

_See code: [src/commands/shell.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/shell.ts)_

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

_See code: [src/commands/start.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/start.ts)_

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

_See code: [src/commands/stop.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/stop.ts)_
<!-- commandsstop -->
