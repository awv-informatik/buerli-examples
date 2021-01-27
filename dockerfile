FROM ubuntu:18.04

RUN apt update && \
  apt install -y curl locales libicu60 libglu1-mesa-dev ocl-icd-opencl-dev && \
  locale-gen en_US.UTF-8 && \
  update-locale LANG=en_US.UTF-8

###############################
## INSTALL node / npm / yarn
###############################

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt install -y nodejs
RUN npm i -g yarn

# confirm installation
RUN node -v
RUN npm -v

###############################
## INSTALL buerli-examples
###############################

ENV BEX_DIR /buerli-examples
RUN mkdir -p $BEX_DIR
ENV CLIENT_DIR $BEX_DIR/client
RUN mkdir -p $CLIENT_DIR
ENV SERVER_DIR $BEX_DIR/server
RUN mkdir -p $SERVER_DIR

COPY ./client $BEX_DIR/client
COPY ./server $BEX_DIR/server

WORKDIR $CLIENT_DIR
RUN yarn

WORKDIR $SERVER_DIR
COPY ./docker-res/package-linux.json $SERVER_DIR/package.json
COPY ./docker-res/EnterpriseBaseModeling.ccapp $SERVER_DIR/EnterpriseBaseModeling.ccapp
RUN yarn
RUN chmod -R +x ./node_modules/@awvinf/classcad-linux-x64
RUN cp ./node_modules/@awvinf/classcad-linux-x64/libboost* /lib/x86_64-linux-gnu

WORKDIR $BEX_DIR
COPY ./docker-res/start.sh $BEX_DIR/start.sh
RUN chmod +x start.sh
CMD ./start.sh
