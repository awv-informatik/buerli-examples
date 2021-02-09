# buerli examples

This repository contains examples to describe how to work with buerli/ClassCAD.

## Getting Started

### ClassCAD Server

First of all you need a running ClassCAD Server, which offers the CAD service via WebSocket. In the subdirectory `./server` you can find the corresponding template of an npm package.

How to start the [server](./server/README.md).

### Client

If the ClassCAD server is up, you are ready to start building cool CAD web apps!

The client project bundles the different use cases into one npm package. The client project is located in the subfolder `./client`.

How to start the [client](./client/README.md).

It contains examples for the following use cases:

- [Solid Modeling Application - _client/src/solid-api_](./client/src/solid-api)
- [History Modeling Application - _client/src/history-api_](./client/src/history-api)
- [Customizable CAD Application - _client/src/customizable-cad_](./client/src/customizable-cad)

![overview](./docs/images/Overview.svg)
