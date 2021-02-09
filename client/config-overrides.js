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

module.exports = (config, env) =>
  override(
    addWebpackModuleRule({ test: /\.of1$/, use: 'arraybuffer-loader' }),
    addReactRefresh({}),
    disableEsLint(),
    removeModuleScopePlugin(),
    fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: true }),
    addLessLoader({ javascriptEnabled: true }),
  )(config, env)
