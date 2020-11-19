# The ClassCAD Server

---

## ⚠️ Currently only available for beta users!

---

## Introduction

In short, ClassCAD is a framework for developing CAD-based applications. ClassCAD enables the efficient development of complex applications that require classic CAD-functionality.

## Getting Started

1. By running `yarn` you have already installed the ClassCAD binaries.

   ```
   yarn
   ```

1. Go to [buerli.io](https://buerli.io), sign up for a **user account** and download the required application package. Place the downloaded `ccapp` in a secure folder on your local system.

   > Since this file contains sensitiv data, be sure to keep it private and do not commit it to any source control.

   > ⚠️ **Important!** The user area of buerli.io is under construction and not yet available!

1. Open the file `package.json` and replace the path passed to `--ccapp` with the full path to your `ccapp` file downloaded just before.

   ```json
   // package.json
   "scripts": {
     "start": "classcad-server --port 9091 --inst 1 --ccapp <FULL PATH TO CCAPP FILE>"
   }
   ```

   To print the description of all available options, just run the command:

   ```
   yarn classcad-server --help
   ```

1. Now, you are ready to start ClassCAD

   ```
   yarn start
   ```
