# Getting started

Note: this tutorial always refers to `docker` and `docker-compose`, never to `sudo docker` and `sudo docker-compose`, for readability. Adapt the commands accordingly for your setup.
We also use indifferently "host", "host machine", "laptop" or "workstation" to refer to the machine you're using ce-dev on; and "guest", "container" or "service" to refer to running containers. It will still work the same whether you actually use a laptop or not &#128521;

## Quickstart
Lets create a new Drupal 8 project. In a terminal `cd` to some convenient location, eg ~/Code or ~/Projects, and type:

```
ce-dev create
```
You'll be prompted for a name for your project. We'll use "hello" in this example. Keep it simple and short, and use only lowercase letters and numbers. This avoids issues when it's later reused in various places (server name, database names, etc) that struggle with underscores or hyphens.

Pick "drupal8" as the project type.

This will generate a new "hello" directory, intialized as local git repo, with the following structure:
```
.
└── ce-dev
    ├── ansible
    │   ├── deploy.yml
    │   └── provision.yml
    ├── ce-dev.compose.prebuilt.yml
    └── ce-dev.compose.yml
```

We can now initialize the project:
```
cd hello
ce-dev init
```
What this has done is:
- generated the final [docker-compose.yml](compose) file
- Updated/created the [SSL](ssl) CA on your host

Next step is to start our containers.
```
ce-dev start
```
What happened is:
- we called `docker-compose up`
- ensured file permissions, ownership and uid/gid match between your user on the host and the 'ce-dev' user within the container
- started Unison file synchronisation
- updated the /etc/hosts file on your laptop
You should now have two new running containers (check with `docker ps`), hello-db and hello-web. If you `cat /etc/hosts` you should also see matching entries for those.

We now need to configure the containers.
```
ce-dev provision
```
We have used Ansible to [provision](provision) the running containers:
- installed php and nginx, generated a matching vhost
- created an SSL certificate for www.hello.local

So, we have running containers, with the needed software installed and configured, but we still need one last step:
```
ce-dev deploy
```
We have used Ansible (again) to [setup the application](deploy). In short, we've basically done
- composer install
- generated a settings.php file
- drush install/path/to/vendor/bin

We're now ready to go and start using our newly spinned up instance:
```
ce-dev browse
```
That should open https://www.hello.local in a new browser's tab, with a fresh Drupal instance.
```
ce-dev shell
```
Will open a shell in the 'web' container. You can then `cd ~/deploy/live.local` and run a `drush uli` to grab a login link.