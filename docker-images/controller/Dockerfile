FROM codeenigma/ce-dev-1.x:latest

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  echo 'deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main' > /etc/apt/sources.list.d/ansible.list && \
  apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" ansible python-boto3 && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*


RUN su - ce-dev -c "git clone --branch 1.x https://github.com/codeenigma/ansible-provision.git /home/ce-dev/ansible-provision"

COPY ./provision.yml /home/ce-dev/ansible-provision/provision.yml

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  echo 'deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main' > /etc/apt/sources.list.d/ansible.list && \
  apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 && \
  apt-get update && \
  su - ce-dev -c "/usr/bin/ansible-playbook /home/ce-dev/ansible-provision/provision.yml" && \
  rm /home/ce-dev/ansible-provision/provision.yml && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*