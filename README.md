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
* [`ce-dev hello [FILE]`](#ce-dev-hello-file)
* [`ce-dev help [COMMAND]`](#ce-dev-help-command)

## `ce-dev hello [FILE]`

describe the command here

```
USAGE
  $ ce-dev hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ ce-dev hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/pm98zz-c/ce-dev/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
