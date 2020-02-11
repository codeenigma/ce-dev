FROM debian:buster

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
    anacron \
    apt-transport-https \
    apt-utils \
    aptitude \
    bash \
    binutils \
    cron \
    curl \
    dirmngr \ 
    git \
    gnupg \
    rsync \
    openssh-server \
    postfix \
    procmail \
    python-apt \
    python-dev \
    python-pycurl \
    rsyslog \
    sudo \
    systemd \
    systemd-sysv \
    unzip \
    vim \
    wget && \
  echo 'UseDNS no' >> /etc/ssh/sshd_config && \
  mkdir -p /var/run/sshd && \
  rm /usr/sbin/policy-rc.d && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  useradd -s /bin/bash ce-dev && \
  echo ce-dev:ce-dev | chpasswd -m && \
  install -m 755 -o ce-dev -g ce-dev -d /home/ce-dev && \
  install -m 700 -o ce-dev -g ce-dev -d /home/ce-dev/.ssh && \
  echo root:ce-dev | chpasswd -m && \
  echo 'ce-dev ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/ce-dev && \
  chmod 0440 /etc/sudoers.d/ce-dev && \
  rm -rf /tmp/*

RUN \
  systemctl mask --   \
  dev-hugepages.mount \
  sys-fs-fuse-connections.mount

RUN \
  rm -f \
    /etc/machine-id \
    /var/lib/dbus/machine-id

ENV container docker
STOPSIGNAL SIGRTMIN+3
VOLUME [ "/sys/fs/cgroup", "/run", "/run/lock", "/tmp" ]

COPY ./ce-dev-start.sh /opt/

CMD ["/bin/sh", "/opt/ce-dev-start.sh", "1000", "1000"]
