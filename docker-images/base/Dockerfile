FROM debian:buster as unison
RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
    p7zip-full \
    build-essential \
    wget \
    ocaml-native-compilers && \
  cd /tmp/ && \
  wget https://github.com/bcpierce00/unison/archive/v2.51.2.tar.gz && \
  tar -xzvf v2.51.2.tar.gz && \
  cd /tmp/unison-2.51.2 && \
  make

FROM debian:buster

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
    apt-transport-https \
    apt-utils \
    aptitude \
    bash \
    curl \
    dirmngr \ 
    git \
    gnupg \
    rsync \
    openssh-server \
    sudo \
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
  rm -f \
    /etc/machine-id \
    /var/lib/dbus/machine-id
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

COPY --from=unison /tmp/unison-2.51.2/src/unison /usr/local/bin/
COPY --from=unison /tmp/unison-2.51.2/src/unison-fsmonitor /usr/local/bin
COPY ./ce-dev-ownership.sh /opt/
COPY ./ce-dev-ssh.sh /opt/
COPY ./unison.sh /opt/
COPY ./unison-startup.sh /opt/

RUN \
  mkdir -p /home/ce-dev/deploy/live.local /home/ce-dev/.composer/cache /home/ce-dev/.nvm/versions/node && \
  chown -R ce-dev:ce-dev /home/ce-dev

RUN \
  systemctl mask --   \
  dev-hugepages.mount \
  sys-fs-fuse-connections.mount

ENV container docker
STOPSIGNAL SIGRTMIN+3
VOLUME [ "/sys/fs/cgroup", "/run", "/run/lock", "/tmp" ]

ENTRYPOINT ["/sbin/init"]