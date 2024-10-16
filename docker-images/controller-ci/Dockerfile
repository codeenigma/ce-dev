# This Dockerfile is a mix of ce-dev's controller image
# https://github.com/codeenigma/ce-dev/tree/2.x/docker-images/controller
#
# And a GitLab Runner controller based on
# https://gitlab.com/tmaczukin-test-projects/fargate-driver-debian/-/blob/master/Dockerfile

# Prepare the container

FROM codeenigma/ce-dev:2.x

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get dist-upgrade -y -o Dpkg::Options::="--force-confnew" && \
  apt-get install -y -o Dpkg::Options::="--force-confnew" \
  git ca-certificates git-lfs && \
  apt-get clean  && \
  pip3 install ansible boto3 && \
  git lfs install --skip-repo && \
  update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
  useradd -m controller && \
  usermod -a -G controller ce-dev && \
  mkdir -p /home/controller/.ssh && \
  chmod -R 700 /home/controller/.ssh && \
  echo "Host remotehost\n\tStrictHostKeyChecking no\n" >> /home/controller/.ssh/config && \
  mkdir -p /home/ce-dev/.ssh && \
  chmod -R 700 /home/ce-dev/.ssh && \
  echo "Host remotehost\n\tStrictHostKeyChecking no\n" >> /home/ce-dev/.ssh/config && \
  rm -rf \
  /var/lib/apt/lists/* \
  /var/log/* \
  /tmp/*

# The keys gets copied in place by before_script in .gitlab-ci.yml
COPY id_rsa* /home/ce-dev/.ssh/
COPY id_rsa* /home/controller/.ssh/

RUN \
  set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  chown -R ce-dev:ce-dev /home/ce-dev/.ssh && \
  chmod 600 /home/ce-dev/.ssh/id_rsa && \
  chmod 644 /home/ce-dev/.ssh/id_rsa.pub && \
  chown -R controller:controller /home/controller/.ssh && \
  chmod 600 /home/controller/.ssh/id_rsa && \
  chmod 644 /home/controller/.ssh/id_rsa.pub

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

# Install GitLab Runner and requirements

# ---------------------------------------------------------------------
# Install https://github.com/krallin/tini - a very small 'init' process
# that helps processing signalls sent to the container properly.
# ---------------------------------------------------------------------
ARG TINI_VERSION=v0.19.0

RUN curl -Lo /usr/local/bin/tini https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-amd64 && \
  chmod +x /usr/local/bin/tini

EXPOSE 22

# ----------------------------------------
# Install GitLab CI required dependencies.
# ----------------------------------------
ARG GITLAB_RUNNER_VERSION=v12.9.0

RUN curl -Lo /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/${GITLAB_RUNNER_VERSION}/binaries/gitlab-runner-linux-amd64 && \
  chmod +x /usr/local/bin/gitlab-runner && \
  # Test if the downloaded file was indeed a binary and not, for example,
  # an HTML page representing S3's internal server error message or something
  # like that.
  gitlab-runner --version

# ---------------------------------------------------------------------------------------------------
# Execute a startup script.
# https://success.docker.com/article/use-a-script-to-initialize-stateful-container-data
# for reference.
#
# Script from here:
# https://gitlab.com/tmaczukin-test-projects/fargate-driver-debian/-/blob/master/docker-entrypoint.sh
# ---------------------------------------------------------------------------------------------------
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
