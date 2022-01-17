# Troubleshooting
## File sync issues
Changes in files on your host not being reflected in the container(s) can have a few causes:
### Inotify
If your files are not updating you should check the [maximum permitted `inotify` watchers](install#inotify-watcher-limit).
### Text editor
The way some editors behave on save means the inumber of the file does not change, so unison does not pick up a difference and the files in your containers do not update. Notable culprits are `vim` and `Atom`. In both cases there are fixes - for example the `local-history` plugin for `Atom` forces it to behave as we need. If you have mysterious issues with files not changing in your containers and it isn't the `inotify` watcher limit above, check how your editor behaves.

## Cgroup Issues
If your ce-dev is failing to even start the controller then you'll see a response that looks like this.
```
Creating ce_dev_controller ... done
Ensure user UID match those on the host...
Ensure user UID match those on the host... !
    Error: Command failed: sudo docker exec ce_dev_controller /bin/sh /opt/ce-dev-ownership.sh 1000 1000
```
There will be very little in the way of logs or errors from this. Just an indication of a problem.

It turns out that if you are using Ubuntu 21.10 (or POP! OS) then it will be using kernelstub and not grub. This might create incompatabilities between docker and cgroup version 2. To fix this you need to run the following commands.

```
sudo kernelstub -a "systemd.unified_cgroup_hierarchy=0"  
sudo update-initramfs -c -k all
```

They will take a while to run (about 10 minutes), but once complete reboot your machine and delete any created containers that velong to the ce_dev image. When you rebuild the ce-dev controller (by running any command) it should create fine.

## VM Networking issue
If you're running ce-dev from within a Virtual Machine (eg. KVM/qemu), Docker container network ports are only 'exposed' to the hypervisor (ie the VM), and are not published for external access.
In order to access sites/files deployed by ce-dev, the ports needs to be published so that the Docker containers can be accessed from your workstation.
After running ```ce-dev init``` (before ```ce-dev start```) edit the ~/project/ce-dev/docker-compose.yml

Replace;
```
    expose:
      - 443
      - 80
      - '22'
```
With;
```
    ports:
      - '443:443'
      - '80:80'
      - '22'
```
