controller-ci
=============
Although `ce-dev` is a cli tool first and foremost, it can be used to pack containers to use with `ce-provision` and CI. This is simply an EXAMPLE for provisioning a controller for running `ce-provision` in a container with GitLab CI.

Every organisation wanting to run `ce-provision` in a container must necessarily make their own container image which incorporates their own version of `ce-provision-config` and installs the dependencies for their choice of CI. There can be no such thing as a "generic" CI container because it needs to contain secrets and it needs to be tailored to the CI product.

As such any generated CI container *must* be private in the container registry, never make them public.

The Dockerfile within is a mix of `ce-dev`'s controller image:
* https://github.com/codeenigma/ce-dev/tree/2.x/docker-images/controller

And a GitLab Runner controller based on this project:
* https://gitlab.com/tmaczukin-test-projects/fargate-driver-debian/-/blob/master/Dockerfile

You can build this container to see how it works, but it will not work with your infra because it currently incorporates an example `ce-provision-config` repo.

# Key handling and user management
The main complications with using ce-dev to build a CI container are:
* The SSH private key to access your config repo will need baking in
* The username for provisioning infrastructure is typically `controller`, whereas the `ce-dev` containers are packed with `ce-dev` as the user

To get around this you can copy an SSH key on to the container, either via a CI variable or from the machine orchestrating the CI. In our example `Dockerfile` we are handling copying a key from the host. Note in particular we create the `controller` user in advance and we add `ce-dev` to the `controller` group. Also, importantly, we this to the `ansible-playbook` command:
* ` --extra-vars=\"{ansible_common_remote_group: controller}\"`

This is important, so the ownership of tmp files created by `ce-dev` can be changed to use the `controller` group, thus the `controller` user can access them. Otherwise `become: controller` in Ansible will fail.

Steps will vary with CI flavour, but with GitLab CI we use `before_script` and `after_script` to ensure the private and public keys are where `docker` needs them to be, *and* to clean up the private key when we're finished:

```yaml
before_script:
  - cp -r /PATH/TO/KEYS/id_rsa* $CI_PROJECT_DIR/docker-images/controller-ci/

after_script:
  - rm $CI_PROJECT_DIR/docker-images/controller-ci/id_rsa
```

With these extra changes in place you should be able to pack a `docker` image that uses the `controller` user for executing `ce-provision` and has all the secrets and permissions it needs to build infrastructure.
