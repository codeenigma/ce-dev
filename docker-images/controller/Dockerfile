FROM codeenigma/ce-dev-1.x:latest

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
  git \
  ansible \
  python3-boto3 && \
  apt-get clean  && \
  update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
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
  su - ce-dev -c "/usr/bin/ansible-playbook /home/ce-dev/ce-provision/provision.yml" && \
  rm /home/ce-dev/ce-provision/provision.yml && \
  apt-get clean  && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*
