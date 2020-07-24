# Troubleshooting
## File sync issues
Changes in files on your host not being reflected in the container(s) can have a few causes:
### Inotify
If your files are not updating you should check the [maximum permitted `inotify` watchers](install#inotify-watcher-limit).
### Text editor
The way some editors behave on save means the inumber of the file does not change, so unison does not pick up a difference and the files in your containers do not update. Notable culprits are `vim` and `Atom`. In both cases there are fixes - for example the `local-history` plugin for `Atom` forces it to behave as we need. If you have mysterious issues with files not changing in your containers and it isn't the `inotify` watcher limit above, check how your editor behaves.
