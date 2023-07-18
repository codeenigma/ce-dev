# User config

You can access a few global settings using `ce-dev config`.

## Binaries
You can alter the commands called for 'docker', 'docker compose' and 'mkcert'. This is mostly useful if you added your user to the 'docker' group on Linux and don't want to be prompted for your password. Or if you're doing funky stuff !

## SSH Username and Key
Define the default username and private key to be used to be able to [SSH from containers to private resources](ssh), eg. cloning private repos or syncing environments back.
