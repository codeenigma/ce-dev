FROM codeenigma/ce-dev:2.x

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
  git ca-certificates git-lfs openssh-client nfs-common stunnel4 python3-venv && \
  apt-get clean  && \
  update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
  # Set up a temporary Python virtual environment to run Ansible from while provisioning our container
  su - ce-dev -c "python3 -m venv /home/ce-dev/ansible" && \
  su - ce-dev -c "/home/ce-dev/ansible/bin/pip3 install ansible netaddr boto3" && \
  su - ce-dev -c "/home/ce-dev/ansible/bin/ansible-galaxy collection install ansible.posix --force" && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*


RUN su - ce-dev -c "git clone --branch 2.x https://github.com/codeenigma/ce-provision.git /home/ce-dev/ce-provision"

COPY ./provision.yml /home/ce-dev/ce-provision/provision.yml

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  su - ce-dev -c "/home/ce-dev/ansible/bin/ansible-playbook --extra-vars=\"{ansible_common_remote_group: ce-dev}\" /home/ce-dev/ce-provision/provision.yml" && \
  rm /home/ce-dev/ce-provision/provision.yml && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*
