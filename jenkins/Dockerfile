FROM jenkins/jenkins:lts

USER root

# Instala docker CLI
RUN apt-get update && \
    apt-get install -y docker.io

# (opcional) instala docker compose plugin
RUN apt-get install -y docker-compose-plugin

USER jenkins