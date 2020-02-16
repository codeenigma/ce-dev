FROM ce-dev-base:latest

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

COPY ./provision.yml /home/ce-dev/provision.yml

RUN \
  su - ce-dev -c "git clone https://github.com/codeenigma/ansible-provision.git /home/ce-dev/ansible-provision" && \
  su - ce-dev -c "cd /home/ce-dev/ansible-provision && /usr/bin/ansible-playbook /home/ce-dev/provision.yml" && \
  rm /home/ce-dev/deploy.yml && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

COPY ./deploy.yml /home/ce-dev/deploy.yml

RUN \
  su - ce-dev -c "cd /home/ce-dev/ansible-provision && /usr/bin/ansible-playbook /home/ce-dev/deploy.yml" && \
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
