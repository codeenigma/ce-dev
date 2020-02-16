FROM ce-dev-base:latest

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
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

RUN \
  mkdir -p /home/ce-dev/deploy /home/ce-dev/.composer/cache /home/ce-dev/.nvm/versions/node && \
  chown -R ce-dev:ce-dev /home/ce-dev

RUN \
  systemctl mask --   \
  dev-hugepages.mount \
  sys-fs-fuse-connections.mount

ENV container docker
STOPSIGNAL SIGRTMIN+3
VOLUME [ "/sys/fs/cgroup", "/run", "/run/lock", "/tmp" ]

COPY ./ce-dev-start.sh /opt/

CMD ["/sbin/init"]
