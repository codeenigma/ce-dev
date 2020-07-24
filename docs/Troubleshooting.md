ce-dev
======

# Troubleshooting
## Files not updating in the container
## inotify watcher limit
If your files are not updating you should check the maximum permitted `inotify` watchers. On most systems it will be a command like this:

* `cat /proc/sys/fs/inotify/max_user_watches`

The default value is often `8192`, which can be too low for modern applications with a Git repository and lots of dependencies being pulled in by a package manager. You can change this to a more suitable number, usually `65536` is sufficient. The location of the `inotify` config is different on different systems, here is an Ubuntu guide

* https://dev.to/rubiin/ubuntu-increase-inotify-watcher-file-watch-limit-kf4

## Editor does not update file inumber
The way some editors behave on save means the inumber of the file does not change, so unison does not pick up a difference and the files in your containers do not update. Notable culprits are `vim` and `Atom`. In both cases there are fixes - for example the `local-history` plugin for `Atom` forces it to behave as we need. If you have mysterious issues with files not changing in your containers and it isn't the `inotify` watcher limit above, check how your editor behaves.
