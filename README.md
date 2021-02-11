# buerli examples

Examples that show what buerli and ClassCAD can do.

## Getting Started

### ClassCAD Server

First of all you need a running ClassCAD Server, which offers the CAD service via WebSocket. In the subdirectory `./server` you can find the corresponding template of an npm package.

How to start the [server](./server/README.md).

### Client

If the ClassCAD server is up, you are ready to start building cool CAD web apps!

The client project bundles the different use cases into one npm package. The client project is located in the subfolder `./client`.

How to start the [client](./client/README.md).

It contains examples for the following use cases:

- [Solid Modeling Application - _client/src/solid_](./client/src/solid)
- [History Modeling Application - _client/src/history_](./client/src/history)
- [Customizable CAD Application - _client/src/customizable_](./client/src/customizable)

![overview](./docs/images/Overview.svg)
