controller-ci
=============

This is simply an EXAMPLE for provisioning a controller for running ce-provision in a container with GitLab CI.

Every organisation wanting to run ce-provision in a container must necessarily make their own container image which incorporates their own version of ce-provision-config and installs the dependencies for their choice of CI. There can be no such thing as a "generic" CI container because it needs to contain secrets and it needs to be tailored to the CI product.

As such any generated CI container *must* be private in the container registry, never make them public.

The Dockerfile within is a mix of ce-dev's controller image:
* https://github.com/codeenigma/ce-dev/tree/1.x/docker-images/controller

And a GitLab Runner controller based on this project:
* https://gitlab.com/tmaczukin-test-projects/fargate-driver-debian/-/blob/master/Dockerfile

You can build this container to see how it works, but it will not work with your infra because it currently incorporates an example ce-provision-config repo.
