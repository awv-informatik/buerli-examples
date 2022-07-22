"use strict";(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[5686],{"./node_modules/raw-loader/dist/cjs.js!./src/history/models/Nut-Bolt_Assembly.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_exports__.default="import { FlipType, ReorientedType } from '@buerli.io/classcad'\r\nimport { ApiHistory } from '@buerli.io/headless'\r\nimport arraybuffer from '../../shared/resources/Bolt.of1'\r\nimport arraybuffer2 from '../../shared/resources/Nut.of1'\r\nimport { ParamType } from '../store'\r\n\r\nexport const create = async (api: ApiHistory, params?: ParamType) => {\r\n  const pt0 = { x: 0, y: 0, z: 0 }\r\n  const xDir = { x: 1, y: 0, z: 0 }\r\n  const yDir = { x: 0, y: 1, z: 0 }\r\n\r\n  const shaftDiameter = 10\r\n  const shaftLength = 37\r\n  const nutBoltAsm = await api.createRootAssembly('NutBolt_Asm')\r\n\r\n  /* Bolt */\r\n  const bolt = await api.loadProduct(arraybuffer, 'of1')\r\n\r\n  api.setExpressions(\r\n    bolt[0],\r\n    { name: 'Shaft_Length', value: shaftLength },\r\n    { name: 'Shaft_Diameter', value: shaftDiameter },\r\n  )\r\n  const boltRefId = await api.addNode(bolt[0], nutBoltAsm, [pt0, xDir, yDir])\r\n\r\n  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')\r\n  const wcsIdOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')\r\n\r\n  /* Nut */\r\n  const nut = await api.loadProduct(arraybuffer2, 'of1')\r\n  api.setExpressions(nut[0], { name: 'Hole_Diameter', value: shaftDiameter })\r\n  const nutRefId = await api.addNode(nut[0], nutBoltAsm, [pt0, xDir, yDir])\r\n  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')\r\n\r\n  /* Bolt at origin */\r\n  await api.createFastenedOriginConstraint(\r\n    nutBoltAsm,\r\n    { matePath: [boltRefId], wcsId: wcsIdOrigin[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },\r\n    0,\r\n    0,\r\n    0,\r\n    'FOC',\r\n  )\r\n\r\n  /* Nut on Bolt */\r\n  await api.createFastenedConstraint(\r\n    nutBoltAsm,\r\n    { matePath: [nutRefId], wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },\r\n    { matePath: [boltRefId], wcsId: wcsIdBoltNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },\r\n    0,\r\n    0,\r\n    0,\r\n    'FC1',\r\n  )\r\n  return nutBoltAsm\r\n}\r\n\r\nexport default create\r\n"}}]);