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