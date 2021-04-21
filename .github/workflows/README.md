# GitHub Actions

## ce-dev-build

This builds the images and binaries, pushes the Docker containers to Docker Hub, pushes the binaries to a GitHub release and builds and commits the ce-dev documentation. It runs when someone accepts a PR for or pushes to the `1.x` branch and has added a valid tag in the format `1.*`.

### Known issues

* The golang release needs keeping up to date (there's no 'latest' download we can use)
* mkcert is built from source, initially because of a bad release but now it's like that we might as well keep it that way
* If we start developing in a new version branch we will need to update the `on: push:` YAML in this workflow or it won't execute

## ce-dev-lint

This runs ESLint over the JavaScript code in the `src` directory. It runs on every pull request. It uses the ESLint config defined in `./.eslintrc` so if you need to change its behaviour, edit that file.

## ce-dev-test

This builds the images and tests the ce-dev stack. It runs on every pull request and daily at 6:30.

### Known issues

* The golang release needs keeping up to date (there's no 'latest' download we can use)
* mkcert is built from source, initially because of a bad release but now it's like that we might as well keep it that way
