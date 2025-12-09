FROM ubuntu:22.04

RUN apt-get update && \
  apt-get install -y curl

# Install node and npm by using nvm
ENV NODE_VERSION v18.18.2
ENV NVM_DIR /usr/local/nvm
ENV NODE_PATH $NVM_DIR/$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH
RUN mkdir $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
RUN echo "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && nvm use default" | bash

# Install and run the examples client
ENV CLIENT_DIR /buerli
RUN mkdir -p $CLIENT_DIR
WORKDIR $CLIENT_DIR

COPY ./ $CLIENT_DIR
RUN npm i


CMD npm run start -- --host
