/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { Server, Logger } = require("@buerli.io/node");

/**
 * Setup the ClassCAD server in more detail.
 *
 * Mainly needed for ClassCAD/buerli developers.
 *
 * Run: `node advanced-server.js`
 */
const server = new Server(
  {
    // -------------DEFAULT SETTINGS--------------------------------------------
    instances: 5,
    configurationData: "ClassCAD.ini",
    ccappFile: "<PATH TO CCAPP FILE>.ccapp",
    output: path.resolve("./node_modules/@awvinf/classcad-windows-x64"), // replace with classcad-linux-x64 if linux is your system
    publicPort: 9091,
    enableInvisibleGraphics: true,
  },
  [
    Logger({
      spinOnFirstUser: true,
      characterLimit: Infinity,
    }),
  ]
);
server.start();
