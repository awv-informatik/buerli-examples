/* eslint-disable @typescript-eslint/no-var-requires */
const {
  removeModuleScopePlugin,
  fixBabelImports,
  override,
  disableEsLint,
  addWebpackModuleRule,
} = require('customize-cra')

const customizeCra = override(
  addWebpackModuleRule({ test: /\.(of1|stp)$/, use: 'arraybuffer-loader' }),
  disableEsLint(),
  removeModuleScopePlugin(),
  fixBabelImports('import', { libraryName: 'antd', libraryDirectory: 'es', style: true }),
)

module.exports = {
  webpack: (config, env) => {
    // Apply customize-cra overrides
    const modifiedConfig = customizeCra(config, env)

    // const rule = modifiedConfig.module.rules.find(k => k.oneOf !== undefined)
    // rule.oneOf = rule.oneOf.map(one => {
    //   if (one.exclude) {
    //     one.exclude = [/^$/, /\.(js|mjs|jsx|ts|tsx|mdx|md)$/, /\.html$/, /\.json$/]
    //   }
    //   return one
    // })

    modifiedConfig.module.rules
      .find(k => k.oneOf !== undefined)
      .oneOf.unshift({ test: /\.(md|mdx)$/, loader: '@mdx-js/loader' })

    return modifiedConfig
  },
}
