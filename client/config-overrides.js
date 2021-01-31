/* eslint-disable @typescript-eslint/no-var-requires */
const {
  addWebpackAlias,
  // addWebpackPlugin,
  removeModuleScopePlugin,
  babelInclude,
  fixBabelImports,
  addLessLoader,
  override,
  disableEsLint,
  addWebpackModuleRule,
} = require('customize-cra')
const { addReactRefresh } = require('customize-cra-react-refresh')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const pRes = path.resolve

module.exports = (config, env) =>
  override(
    addWebpackModuleRule({ test: /\.of1$/, use: 'arraybuffer-loader' }),
    addReactRefresh({}),
    disableEsLint(),
    removeModuleScopePlugin(),
    fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: true }),
    addLessLoader({ javascriptEnabled: true }),
    // process.env.NODE_ENV === 'production' && addWebpackPlugin(new BundleAnalyzerPlugin()),
    babelInclude([pRes('src')].filter(Boolean)),
    addWebpackAlias({
      drei: pRes('node_modules/drei'),
      react: pRes('node_modules/react'),
      antd: pRes('node_modules/antd'),
      three: pRes('node_modules/three'),
      zustand: pRes('node_modules/zustand'),
      'react-three-fiber': pRes('node_modules/react-three-fiber'),
      'react-dom': pRes('node_modules/react-dom'),
      'styled-components': pRes('node_modules/styled-components'),
      '@buerli.io/core': pRes('node_modules/@buerli.io/core'),
      '@buerli.io/react/build': pRes('node_modules/@buerli.io/react'),
      '@buerli.io/react': pRes('node_modules/@buerli.io/react'),
      '@buerli.io/classcad': pRes('node_modules/@buerli.io/classcad'),
      '@buerli.io/headless': pRes('node_modules/@buerli.io/headless'),
      '@buerli.io/plugins': pRes('node_modules/@buerli.io/plugins'),
    }),
  )(config, env)
