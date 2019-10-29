ARG versionTag
FROM codeenigma/ce-dev:$versionTag

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
  rm -rf /tmp/* && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get clean

RUN su - ce-dev -c "git clone https://github.com/codeenigma/ansible-provision.git /home/ce-dev/ansible-provision"
RUN su - ce-dev -c "/usr/bin/ansible-playbook /home/ce-dev/ansible-provision/playbook.yml --extra-vars '{\"is_local\":\"yes\"}'"
