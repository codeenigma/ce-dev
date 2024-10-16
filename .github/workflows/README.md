# GitHub Actions
This document describes the current CI for the ce-dev project. The CI is written for GitHub Actions, the built in GitHub system for orchestration and automation. We operate three separate GitHub Actions workflows.

### devel-ubuntu-linux.yml

Linux - Build binaries, images and templates using devel mode.

### ubuntu-linux.yml

Linux - Build binaries, images and templates. Docker images are pushed. New release is created.

# Testing project images
To test a `devel` container on a project, firstly fetch the container image:

```
docker pull codeenigma/ce-dev-controller:2.x
```

Then edit your project's `ce-dev.compose.yml` file, changing the image for each applicable service to use the `-devel` tag instead of the current tag, for example:

```yaml
    image: codeenigma/ce-dev:2.x -> image: codeenigma/ce-dev:2.x-devel 
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
docker pull codeenigma/ce-dev-controller:2.x-devel
# Replace the 'latest' tag with your 'devel' image
docker tag codeenigma/ce-dev-controller:2.x-devel codeenigma/ce-dev-controller:2.x
docker kill ce_dev_controller
# Then in any ce-dev project
ce-dev start
ce-dev provision
```

If you need to hop branches of `ce-provision` or `ce-deploy` on the controller to try things you can hop on to the container and merge the test branch into `2.x` like so:

```bash
docker exec -it ce_dev_controller bash
su ce-dev
cd ~/ce-provision # or ~/ce-deploy
git merge origin my_test_branch
```

Then use `ce-dev provision` and `ce-dev deploy` in the usual way.

### Known issues
* The golang release needs keeping up to date (there's no 'latest' download we can use)
* `mkcert` is built from source, initially because of a bad release but now it's like that we might as well keep it that way
* If we start developing in a new version branch we will need to update the `on: push:` YAML in this workflow to allow the new tags or it won't execute
