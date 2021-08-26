/* eslint-disable @typescript-eslint/no-var-requires */
const {
  removeModuleScopePlugin,
  fixBabelImports,
  addLessLoader,
  override,
  disableEsLint,
  addWebpackModuleRule,
} = require('customize-cra')

module.exports = (config, env) =>
  override(
    addWebpackModuleRule({ test: /\.(of1|stp)$/, use: 'arraybuffer-loader' }),
    disableEsLint(),
    removeModuleScopePlugin(),
    fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: true }),
    addLessLoader({ javascriptEnabled: true }),
  )(config, env)
