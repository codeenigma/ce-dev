# GitHub Actions
This document describes the current CI for the ce-dev project. The CI is written for GitHub Actions, the built in GitHub system for orchestration and automation. We operate three separate GitHub Actions workflows.

## ce-dev-build-dev
Builds base and controller images using the contents of the `devel` branch on push. The built images get pushed to Docker Hub and tagged with `devel`. This is very useful for pushing test containers to try out locally.

### Testing project images
To test a `devel` container on a project, firstly fetch the container image:

```
docker pull codeenigma/ce-dev-controller-1.x:devel
```

Then edit your project's `ce-dev.compose.yml` file, changing the image for each applicable service to use the `devel` tag instead of the `latest` tag, for example:

```yaml
    image: codeenigma/ce-dev-1.x:devel
```

Finally, destroy and recreate your `docker compose` file and containers:

```bash
ce-dev destroy
ce-dev init -t ce-dev.compose.yml
ce-dev start
ce-dev provision
ce-dev deploy
```

### Testing an experimental controller
To test the `devel` version of the `ce-dev-controller` image locally you can do the following:

```bash
docker pull codeenigma/ce-dev-controller-2.x:devel
# Replace the 'latest' tag with your 'devel' image
docker tag codeenigma/ce-dev-controller-2.x:devel codeenigma/ce-dev-controller-2.x:latest
docker kill ce_dev_controller_2
# Then in any ce-dev project
ce-dev start
ce-dev provision
```

If you need to hop branches of `ce-provision` or `ce-deploy` on the controller to try things you can hop on to the container and merge the test branch into `1.x` like so:

```bash
docker exec -it ce_dev_controller_2 bash
su ce-dev
cd ~/ce-provision # or ~/ce-deploy
git merge origin my_test_branch
```

Then use `ce-dev provision` and `ce-dev deploy` in the usual way.

### Known issues
* The golang release needs keeping up to date (there's no 'latest' download we can use)
* `mkcert` is built from source, initially because of a bad release but now it's like that we might as well keep it that way

## ce-dev-build
This builds the images and binaries, pushes the Docker containers to Docker Hub, pushes the binaries to a GitHub release and builds and commits the ce-dev documentation. It runs when someone accepts a PR for or pushes to the `1.x` branch and has added a valid tag in the format `1.*`. These images are tagged `latest` in the Docker repository.

### Known issues
* The golang release needs keeping up to date (there's no 'latest' download we can use)
* `mkcert` is built from source, initially because of a bad release but now it's like that we might as well keep it that way
* If we start developing in a new version branch we will need to update the `on: push:` YAML in this workflow to allow the new tags or it won't execute

## ce-dev-lint
This runs ESLint over the JavaScript code in the `src` directory. It runs on every pull request. It uses the ESLint config defined in `./.eslintrc` so if you need to change its behaviour, edit that file.

## ce-dev-test
This builds the images and tests the ce-dev stack. It runs on every pull request and daily at 6:30.

### Known issues
* The golang release needs keeping up to date (there's no 'latest' download we can use)
* `mkcert` is built from source, initially because of a bad release but now it's like that we might as well keep it that way
