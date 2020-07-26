# Commands
<!-- commands -->
* [`ce-dev autocomplete [SHELL]`](#ce-dev-autocomplete-shell)
* [`ce-dev browse`](#ce-dev-browse)
* [`ce-dev build`](#ce-dev-build)
* [`ce-dev clean`](#ce-dev-clean)
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
* [`ce-dev update`](#ce-dev-update)

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

_See code: [src/commands/browse.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/browse.ts)_

## `ce-dev build`

Commit the existing containers as new docker images, and create a new docker-compose file referencing them.

```
USAGE
  $ ce-dev build

OPTIONS
  -d, --destination=destination  [default: ce-dev.compose.prebuilt.yml] Path to the output docker-compose file, relative
                                 to the project ce-dev folder.

  -h, --help                     show CLI help

  -r, --registry=registry        Docker registry to use. This overrides the one defined in the source compose template.

  -t, --template=template        [default: ce-dev.compose.yml] Path to a docker-compose template file, relative to the
                                 project ce-dev folder. WARNING: this must match the original one the project was
                                 constructed with.

EXAMPLE
  $ ce-dev build --template example.compose.yml
```

_See code: [src/commands/build.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/build.ts)_

## `ce-dev clean`

Remove unused Docker artifacts (volumes, images).

```
USAGE
  $ ce-dev clean

OPTIONS
  -q, --quiet  Non-interactive, do not prompt for container deletion choice.

EXAMPLE
  $ ce-dev clean
```

_See code: [src/commands/clean.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/clean.ts)_

## `ce-dev config`

Configure global user preferences.

```
USAGE
  $ ce-dev config

EXAMPLE
  $ ce-dev config
```

_See code: [src/commands/config.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/config.ts)_

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

_See code: [src/commands/create.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/create.ts)_

## `ce-dev deploy`

Setup an app with Ansible playbooks.

```
USAGE
  $ ce-dev deploy

EXAMPLE
  $ ce-dev deploy example-app
```

_See code: [src/commands/deploy.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/deploy.ts)_

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

_See code: [src/commands/destroy.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/destroy.ts)_

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

_See code: [src/commands/init.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/init.ts)_

## `ce-dev provision`

Provision containers with Ansible playbooks.

```
USAGE
  $ ce-dev provision
```

_See code: [src/commands/provision.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/provision.ts)_

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

  -r, --registry=registry  Docker registry to use. This overrides the one defined in the source compose template.

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

  -u, --username=username  Username to use to login against the Docker registry.

EXAMPLE
  $ ce-dev pull --template example.compose.yml
```

_See code: [src/commands/pull.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/pull.ts)_

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

  -r, --registry=registry  Docker registry to use. This overrides the one defined in the source compose template.

  -t, --template=template  [default: ce-dev.compose.prebuilt.yml] Path to a docker-compose template file, relative to
                           the project root. WARNING: this must match the original one the project was constructed with.

  -u, --username=username  Username to use to login against the Docker registry.

EXAMPLE
  $ ce-dev push --template example.compose.yml
```

_See code: [src/commands/push.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/push.ts)_

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

_See code: [src/commands/shell.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/shell.ts)_

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

_See code: [src/commands/start.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/start.ts)_

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

_See code: [src/commands/stop.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/stop.ts)_

## `ce-dev update`

Update base images and ce-dev cli.

```
USAGE
  $ ce-dev update

EXAMPLE
  $ ce-dev update
```

_See code: [src/commands/update.ts](https://github.com/codeenigma/ce-dev/blob/v1.0.25/src/commands/update.ts)_
<!-- commandsstop -->
