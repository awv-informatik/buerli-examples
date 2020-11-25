# buerli starter projects

The projects in this repository serve as a template to easily set up new projects with buerli and ClassCAD. Examples are used to describe how to work with buerli/ClassCAD.

## Getting Started

### 1. Server

First of all you need a running ClassCAD Server, which offers the CAD service via WebSocket. In the subdirectory `./server` you can find the corresponding template of an npm package.

[Please have a look at the server package](./server).

### 2. Client

If the ClassCAD server is up, you are ready to start building cool CAD web apps!

- [Solid API Application](./client/solid-api)
- [History API Application](./client/history-api)
- [Customizable CAD Application](./client/customizable-cad)

## Overview

In order to get a running CAD application with ClassCAD and buerli, you need the following components:
- Server
  - ClassCAD binaries (instructions [here](./server/README.md))
  - ClassCAD app file (instructions [here](./server/README.md))
- Client
  - buerli

![overview](./docs/images/Overview.png)
