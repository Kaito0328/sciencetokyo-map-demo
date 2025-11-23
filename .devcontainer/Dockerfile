FROM node:18-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates sudo \
    && rm -rf /var/lib/apt/lists/* \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER node
WORKDIR /workspace

EXPOSE 3001

CMD ["bash"]