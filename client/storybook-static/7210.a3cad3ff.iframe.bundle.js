"use strict";(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[7210],{"./node_modules/raw-loader/dist/cjs.js!./src/history/models/CreatePart_Example.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_exports__.default="import { ApiHistory } from '@buerli.io/headless'\r\nimport { ParamType } from '../store'\r\n\r\nexport const create = async (api: ApiHistory, params?: ParamType) => {\r\n  const part = api.createPart('Part')\r\n  api.cylinder(part, [], 10, 100)\r\n  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])\r\n  api.fillet(part, topEdges, 2)\r\n  return part\r\n}\r\n\r\nexport default create\r\n"}}]);