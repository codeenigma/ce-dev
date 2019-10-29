ARG versionTag
FROM codeenigma/ce-dev:$versionTag

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew"

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \  
  echo 'deb [arch=amd64] https://download.docker.com/linux/debian buster stable' > /etc/apt/sources.list.d/docker.list && \
  curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" docker-ce && \
  rm -rf /tmp/* && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get clean