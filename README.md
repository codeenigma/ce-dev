ce-dev 2.x
======
Local Stack wrapper tool

[![Build status](https://github.com/codeenigma/ce-dev/actions/workflows/ce-dev-build.yml/badge.svg)](https://github.com/codeenigma/ce-dev/actions/workflows/ce-dev-build.yml)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=security_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=bugs)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=codeenigma_ce-dev&metric=alert_status)](https://sonarcloud.io/dashboard?id=codeenigma_ce-dev)

## Changes since 1.24

* Use of latest Typescript version (5.3.x)
* Binaries built with Emacs instead of Commonjs: Emacs can consume Commonjs modules,
  but Commonjs can't consume Emacs modules. It means we can use more contrib modules
* ce-dev-controller is compatible with ce-provision 1.x and 2.x, by default ce-dev uses ce-provision 2
* src folder has been organised a bit better.
* Removed drupal 8 and drupal 9 templates.
* The way to assign IPs have changed.
* All the packages used are up to date.

## ToDo: Review docs folder

A local stack based on Docker Compose and Ansible. It aims to be easy to use but also stay flexible and powerful by not hiding complexity behind yet another abstraction layer.

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

* Clone this repository in your computer.
* Once you make your changes, run 'yarn' in the root folder
  This will clean and create the {root}/lib folder, with the compiled TS files to JS.
* Use oclif pack to generate new releases for the different Systems
  
  i.e: <code>yarn oclif pack tarballs --targets=linux-x64 --no-xz</code>

  This will create a {root}/dist folder with the different releases of ce-dev.
  You can use the release according to your OS to test the results in your computer
