# GitLab Runner controller based on
# https://gitlab.com/tmaczukin-test-projects/fargate-driver-debian/-/blob/master/Dockerfile
FROM codeenigma/ce-controller-1.x:latest

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


RUN set -x && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get install -y bash ca-certificates git git-lfs && \
  apt-get clean  && \
  git lfs install --skip-repo

# -------------------------------------------------------------------------------------
# Execute a startup script.
# https://success.docker.com/article/use-a-script-to-initialize-stateful-container-data
# for reference.
# -------------------------------------------------------------------------------------
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
