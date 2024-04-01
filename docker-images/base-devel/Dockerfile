FROM debian:bullseye-slim as unison
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
  wget https://github.com/bcpierce00/unison/archive/v2.53.3.tar.gz && \
  tar -xzvf v2.53.3.tar.gz && \
  cd /tmp/unison-2.53.3 && \
  make

FROM debian:bullseye-slim

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
  python3-apt \
  python3-dev \
  python3-pycurl \
  python3-pip \
  python3-venv \
  rsyslog \
  sudo \
  systemd \
  systemd-sysv \
  unzip \
  vim \
  wget && \
  apt-get clean  && \
  update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

RUN \
  echo 'UseDNS no' >> /etc/ssh/sshd_config && \
  mkdir -p /var/run/sshd && \
  rm /usr/sbin/policy-rc.d

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

COPY --from=unison /tmp/unison-2.53.3/src/unison /usr/local/bin/
COPY --from=unison /tmp/unison-2.53.3/src/unison-fsmonitor /usr/local/bin/
COPY ./ce-dev-ownership.sh /opt/
COPY ./ce-dev-ssh.sh /opt/
COPY ./unison.sh /opt/
COPY ./unison-startup.sh /opt/
COPY ./procmailrc /etc/procmailrc

RUN \
  wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 -O /usr/local/bin/mkcert && \
  mkdir -p /home/ce-dev/deploy/live.local /home/ce-dev/.composer/cache /home/ce-dev/.nvm/versions/node /home/ce-dev/.local/share/mkcert && \
  chown -R ce-dev:ce-dev /home/ce-dev && \
  chmod +x /usr/local/bin/*

RUN \
  systemctl mask --   \
  dev-hugepages.mount \
  sys-fs-fuse-connections.mount

ENV container docker
STOPSIGNAL SIGRTMIN+3
VOLUME [ "/sys/fs/cgroup", "/run", "/run/lock", "/tmp" ]

ENTRYPOINT ["/sbin/init"]
