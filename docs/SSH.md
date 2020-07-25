# SSH

We use SSH in two widely different ways.

## Inter-container communication
Because the configuration of containers is made through Ansible, the main controller needs to be able to SSH to any container - or, to be precise, to any container based on the main ce-dev-base image.
This uses a short-lived private/public keys pair, re-generated everytime the controller is re-started. There is thus no risk of someone accessing a running container with a "generic" publicly known key.
It is hold in a separate volume, `ce_dev_ssh`, mounted on all containers and owned by the 'ce-dev' user. This avoids exporting it by mistake if you build an image based on those containers (which would be mostly harmless, as those are re-generated anyway).

## External communication
Access to private resources - think cloning private repos, syncing back environments, `drush sql-sync` or anything advanced - from within the container would normally not be possible without a circumvoluted setup of ssh agent forwarding. You can easily enable it on an individual basis.
### Setting up
For each project, in the top level "x-ce-dev" entry, you can specify a list of hosts that will need to be accessed.

``` yaml
x-ce_dev:
  ssh_hosts:
    - dev.example.com
    - github.com
```
When you first setup such a project with `ce-dev init`, you will be prompted for a username and private key to use for each of the hosts. The default values for those can be altered in your global [user config](userconfig).

*Side note: in case you are wondering what username to use for gitlab.com/github.com or any git server ... it doesn't matter, use whatever. It'll be always be git@ anyway*

### Under the hood
How does it work? How secure is this?

On `ce-dev init`, all we store the combo of host, username and filepath to the key in the project's config. When `ce-dev start` is called, we 
- copy the private key from the host to memory (/dev/shm) on the guest container
- generate an [.ssh/config](https://linux.die.net/man/5/ssh_config) file for the ce-dev user within the container that points to the temporary location

So, to sum it up: 
- The keys only reside in memory (RAM/tpmfs), it can't be exported by mistake as an image or shared, so never leaves your laptop/host machine
- It only "lives" while your container is running, and containers are not reachable from outside your host (see [Inter-container communication](#inter-container-communication) above and the [networking](networking) section for details).

One might object that using a maliciously crafted image, an attacker could then gain access to that key. Keep in mind that this feature only is enabled for container based on the ce-dev-base image (ie, have an x-ce-dev entry in their service definition in the compose configuration), and that said attacker might also as well trick you in running a malicious script, .deb or .rpm package or anything with the same result.
