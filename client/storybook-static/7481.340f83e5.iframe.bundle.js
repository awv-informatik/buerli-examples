"use strict";(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[7481],{"./node_modules/raw-loader/dist/cjs.js!./src/solid/models/fish.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_exports__.default="import { ApiNoHistory } from '@buerli.io/headless'\r\nimport * as THREE from 'three'\r\n\r\nexport const create = async (api: ApiNoHistory) => {\r\n  const x = 25\r\n  const y = 25\r\n  const shape = new THREE.Shape()\r\n  shape.moveTo(x, y)\r\n  shape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)\r\n  shape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)\r\n  shape.quadraticCurveTo(x + 115, y, x + 115, y + 40)\r\n  shape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)\r\n  shape.quadraticCurveTo(x + 50, y + 80, x, y)\r\n  const basicBody = api.extrude([0, 0, 5], shape)\r\n  const geom = await api.createBufferGeometry(basicBody)\r\n  const mesh = new THREE.Mesh(\r\n    geom,\r\n    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 120, 255)') }),\r\n  )\r\n  return [mesh]\r\n}\r\n\r\nexport default create\r\n"}}]);