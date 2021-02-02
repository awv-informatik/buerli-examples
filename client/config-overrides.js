/* eslint-disable @typescript-eslint/no-var-requires */
const {
  addWebpackAlias,
  removeModuleScopePlugin,
  babelInclude,
  fixBabelImports,
  addLessLoader,
  override,
  disableEsLint,
  addWebpackModuleRule,
} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
const path = require('path')
const fs = require('fs')

const pRes = path.resolve
const fsEx = fs.existsSync

const root = '../../'
const bcore = 'buerli/buerli-core'
const breact = 'buerli/buerli-react'
const bclasscad = 'buerli/buerli-classcad'
const bheadless = 'buerli/buerli-headless'
const bplugins = 'buerli-plugins'
const r3f = 'react-three-fiber'
const locR3F = `${root}${r3f}/src/targets/web`
const nmR3F = `node_modules/${r3f}`

const babelInc = [
  pRes(`src`),
  fsEx(`${root}${bcore}`) && pRes(`${root}${bcore}/src`),
  fsEx(`${root}${breact}`) && pRes(`${root}${breact}/src`),
  fsEx(`${root}${bclasscad}`) && pRes(`${root}${bclasscad}/src`),
  fsEx(`${root}${bheadless}`) && pRes(`${root}${bheadless}/src`),
  fsEx(`${root}${bplugins}`) && pRes(`${root}${bplugins}/src`),
  fsEx(`${root}${r3f}`) && pRes(`${root}${r3f}/src`),
].filter(Boolean)

const aliases = {
  react: pRes(`node_modules/react`),
  antd: pRes(`node_modules/antd`),
  'react-dom': pRes(`node_modules/react-dom`),
  'styled-components': pRes(`node_modules/styled-components`),
  three: fsEx(`${root}three.js`) ? pRes(`${root}three.js`) : pRes(`node_modules/three`),
  'react-three-fiber': fsEx(`${root}${r3f}`) ? pRes(locR3F) : pRes(nmR3F),
  '@buerli.io/core': fsEx(`${root}${bcore}`) ? pRes(`${root}${bcore}/src`) : `@buerli.io/core`,
  '@buerli.io/react/build': fsEx(`${root}${breact}`) ? pRes(`${root}${breact}/build`) : `@buerli.io/react`,
  '@buerli.io/react': fsEx(`${root}${breact}`) ? pRes(`${root}${breact}/src`) : `@buerli.io/react`,
  '@buerli.io/classcad': fsEx(`${root}${bclasscad}`) ? pRes(`${root}${bclasscad}/src`) : `@buerli.io/classcad`,
  '@buerli.io/plugins': fsEx(`${root}${bplugins}`) ? pRes(`${root}${bplugins}/src`) : `@buerli.io/plugins`,
  '@buerli.io/headless': fsEx(`${root}${bheadless}`) ? pRes(`${root}${bheadless}/src`) : `@buerli.io/headless`,
}

module.exports = (config, env) =>
  override(
    addWebpackModuleRule({ test: /\.of1$/, use: 'arraybuffer-loader' }),
    addReactRefresh({}),
    disableEsLint(),
    removeModuleScopePlugin(),
    fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: true }),
    addLessLoader({ javascriptEnabled: true }),
    babelInclude(babelInc),
    addWebpackAlias(aliases),
  )(config, env)
