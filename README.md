# buerli-examples

A collection of examples showing how to use the ClassCAD API in TypeScript. 

First, clone the repository

```shell
git clone https://github.com/awv-informatik/buerli-examples
cd buerli-examples
yarn
```

### Connect to ClassCAD

**buerli-examples** needs the ClassCAD engine. It runs in your browser as WebAssembly, or natively on your server. Say which in the `.env` file in the root of this project.

### Running ClassCAD in the browser (WebAssembly)

1. Sign up on [classcad.ch/account](https://classcad.ch/account).
2. Under **Access tokens** on [your account](https://classcad.ch/account#tokens), make a public access token. It starts with `ccpk_`.
3. Put it into `.env`:

```shell
CLASSCAD_PUBLIC_TOKEN=ccpk_…
```

The token is public: it belongs in a page's code, and works on `localhost` and on the domains you register under **Domains** on your account. See [Quickstart with WebAssembly](https://buerli.io/docs/quickstart/wasm).

> The first time ClassCAD starts in the browser, loading may take some time depending on your internet speed.

### Running ClassCAD natively

The native engine (Business plan) runs on your server. Download it, give it its secret access token (`ccsk_…`, it never goes into a page) and start one of its two servers, as described in [Quickstart with a native engine](https://buerli.io/docs/quickstart/native). Then leave `CLASSCAD_PUBLIC_TOKEN` empty in `.env` and set the address of the server you started:

```shell
# classcad-cli worker, through WSClient
WS_URL=ws://localhost:9094
```

```shell
# classcad-socketio, through SocketIOClient
SOCKETIO_URL=ws://localhost:9091
```

### Run the examples

```shell
yarn dev
```

The examples application is now available at http://localhost:5173.

> Please check the console output for possible node incompatiblities of the development tools. In case of problems, the use of `nvm` is recommended. `nvm` allows installing different Node versions on the same system.

### Links to our homepages and documentations

- [buerligons.io](https://buerligons.io)
- [buerli.io](https://buerli.io)
- [classcad.ch](https://classcad.ch)
- [awv-informatik.ch](https://awv-informatik.ch)