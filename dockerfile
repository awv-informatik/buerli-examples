FROM ubuntu:18.04

RUN apt update && \
  apt install -y wget locales libicu60 libglu1-mesa-dev ocl-icd-opencl-dev && \
  locale-gen en_US.UTF-8 && \
  update-locale LANG=en_US.UTF-8

###############################
## INSTALL nvm / node / npm / yarn
###############################

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 10.15.3
RUN mkdir -p $NVM_DIR

# install nvm
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install node and npm
RUN echo "source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default" | bash

RUN npm i -g yarn

# confirm installation
RUN node -v
RUN npm -v

###############################
## INSTALL buerli-examples
###############################

ENV BEX_DIR /buerli-examples
RUN mkdir -p $BEX_DIR
COPY ./ $BEX_DIR
COPY ./res/start.sh $BEX_DIR

ENV CLIENT_DIR $BEX_DIR/client
WORKDIR $CLIENT_DIR
RUN yarn

ENV SERVER_DIR $BEX_DIR/server
WORKDIR $SERVER_DIR
COPY ./res/package-linux.json $SERVER_DIR/package.json
COPY ./res/EnterpriseBaseModeling.ccapp $SERVER_DIR
RUN yarn
RUN chmod -R +x ./node_modules/@awvinf/classcad-linux-x64
RUN cp ./node_modules/@awvinf/classcad-linux-x64/libboost* /lib/x86_64-linux-gnu

WORKDIR $BEX_DIR
CMD ./start.sh
