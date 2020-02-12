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
  echo 'deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main' > /etc/apt/sources.list.d/ansible.list && \
  apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" ansible && \
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
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" python-boto3

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  echo 'deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main' > /etc/apt/sources.list.d/ansible.list && \
  apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" ansible && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

RUN \
  su - ce-dev -c "git clone https://github.com/codeenigma/ansible-provision.git /home/ce-dev/ansible-provision" && \
  su - ce-dev -c "/usr/bin/ansible-playbook /home/ce-dev/ansible-provision/install.yml --extra-vars '{\"is_local\":\"yes\"}'" && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

COPY ./deploy.yml /home/ce-dev/deploy.yml

RUN \
  su - ce-dev -c "export ANSIBLE_CONFIG=/home/ce-dev/ansible-provision/ansible.cfg ; /usr/bin/ansible-playbook /home/ce-dev/deploy.yml --extra-vars '{\"is_local\":\"yes\",\"ansible_provision\":{\"local_dir\":\"/home/ce-dev/ansible-provision\"}}'" && \
  rm /home/ce-dev/deploy.yml && \
  rm -rf /home/ce-dev/.ssh/* && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

COPY ./ce-dev-start.sh /opt/
ENV container docker
CMD ["/bin/sh", "/opt/ce-dev-start.sh", "1000", "1000"]
