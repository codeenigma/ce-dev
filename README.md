ce-dev 2.x
======
Local Stack wrapper tool

[![2.x: Linux - Build ce_dev binaries, images and templates (test)](https://github.com/codeenigma/ce-dev/actions/workflows/ce-dev-devel-linux.yml/badge.svg?branch=2.x-devel)](https://github.com/codeenigma/ce-dev/actions/workflows/ce-dev-devel-linux.yml)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=security_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=bugs)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=alert_status)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)

## Changes since 1.24

* Use of latest Typescript version (5.3.x)
* Binaries built with Emacs instead of Commonjs: Emacs can consume Commonjs modules,
  but Commonjs can't consume Emacs modules. It means we can use more contrib modules
* ce-dev-controller uses ce-provision 2. The roles in provision.yml have been updated.
* src folder has been organised a bit better.
* Removed drupal 8 and drupal 9 templates.
* The way to assign IPs have changed.
* All the packages used are up to date.

## Key features
- Allows several projects (or the host) to re-use the same ports
- Allows mixing any Docker images with ce-dev specific ones
- HTTPS support through [mkcert](https://github.com/FiloSottile/mkcert)
- Built-in Unison sync to avoid bind mount slowness on Mac OS
- Easily build and push ready made images from running containers for you project
- Only defines a few simple commands, and defers to `docker compose` and Ansible beyond that

## [Documentation](https://codeenigma.github.io/ce-dev-docs/2.x/home/)
## [Install](https://codeenigma.github.io/ce-dev-docs/2.x/install/)

## Do you want to contribute?

### Preparation

* Install Node.js in your local machine https://nodejs.org/en/download/package-manager
* Clone this repo in your local machine.
* Change the branch (2.x, 2.x-devel, etc...) to work on it.
* Run ```npm install```

With these steps you will have all the packages installed.

### How to compile

CE-Dev is made with typescript, you need to compile the code to js to make the different distributions.
Once you make your changes in the source dode ({root}/src folder), you need to compile it. To compile you can
execute the following commands:

```
yarn clean
yarn build
```

This will clean and compile the new js files. A new folder {root}/lib is generated
with all the js file. If you only need to test your changes with your current projects you have, you can execute
the commands directly using the run.js file. In this way you don't need to break your current ce-dev installation
(located in /opt/ce-dev)
Example:

```angular2html
{absolute_path}/bin/run.js --help
```

#### Generating new docker images
In case you need to test new docker images (example, when a new major version will be released) you need to build these
images locally. To see the ce-dev version for this branch: you can check the value in this file
```angular2html
src/app-settings.ts
```

Currently having ```ceDevVersion : 2```

it means you would need to have the local docker images with tag 2.x

```angular2html
dioni@dionice:~/projects/wrap$ docker image ls
[sudo] contraseña para dioni: 
REPOSITORY                     TAG                IMAGE ID       CREATED         SIZE
codeenigma/drupal10-db         2.x                5cae51ec65c0   3 days ago      409MB
codeenigma/drupal10-web        2.x                83cc832fb73d   3 days ago      1.47GB
codeenigma/blank-blank         2.x                5157934972ad   3 days ago      1.26GB
codeenigma/ce-dev              2.x                8753195771fc   3 days ago      691MB
codeenigma/ce-dev-controller   2.x                5aed115a5e74   3 days ago      1.83GB
```

if you are testing the devel version, the tag will be 2.x-devel.

If you don't have the local images, you can follow these steps:

1. Delete your current ce_dev_controller...yes stop and delete it, no worries!
   It can be re-created starting a project with your installed ce-dev version
2. Execute the following commands to create the docker images (you may need to add +x to the run.js file).

```angular2html
/bin/sh docker-images/export.sh --version 2.x --image-name ce-dev --dockerfile-path base
/bin/sh docker-images/export.sh --version 2.x --image-name ce-dev-controller --dockerfile-path controller
/bin/sh templates/prebuild.sh --template ce-dev.compose.yml
```

The last step will generate the drupal10-web, drupal10-db and blank docker images. Also, it will create docker containers
with the same name. You can remove these containers because we only need the images.

Now we can start to test our ce-dev changes as it is described in the previous point 'How to compile'


### Testing a new ce-dev release locally.

If you need to test the creation of releases locally, we can do it using oclif.

oclif is an open source framework for building a command line interface (CLI) in Node.js and Typescript https://oclif.io/

As part of the command we used ```yarn build```, a folder /lib was generated. This folder contains the javascript code
used by oclif.

According to your system, your local ce-dev version will be different. Here the list of available targets:
* linux-x64
* linux-arm
* linux-arm64
* win32-x64
* win32-x86
* win32-arm64
* darwin-x64
* darwin-arm64

Probably you will use linux-...64 or darwin-...64 version.

Use oclif pack to generate a new release for your system:
  
i.e: <code>yarn oclif pack tarballs --targets=linux-x64 --no-xz</code>

This will generate a tar.gz file inside a new directory named /dir/ce-dev-xxxxxx
You can un-compress and put it where you want. i.e: you can put it in /opt too (where you have the current ce-dev) 
as ce-dev-local or something like that.

Then you can create the symlink here /usr/bin/local aiming to /opt/ce-dev-local/bin/ce-dev.

From now, you can use
```angular2html
ce-dev-local --help
```

