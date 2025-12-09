/* eslint-disable no-undef */
import * as esModuleLexer from 'es-module-lexer'
import * as fs from 'fs'
import * as path from 'path'

const marker = '?buffer'

const exists = file => {
  try {
    const stats = fs.statSync(file)
    if (stats.isFile()) {
      return true
    }
  } catch (error) {}
  return false
}

const transformImports = async (src, id) => {
  await esModuleLexer.init
  let imports = []
  try {
    imports = esModuleLexer.parse(src)[0]
  } catch (e) {
    return null
  }
  if (!imports.length) {
    return null
  }

  const replacementArr = []

  for (const imp of imports) {
    const { s: start, e: end, ss: expStart, se: expEnd } = imp
    let importedFile = src.slice(start, end)
    if (!importedFile.includes(marker)) continue
    importedFile = importedFile.replace(marker, '')
    const fullPath = path.resolve(path.dirname(id), importedFile)
    if (exists(fullPath)) {
      const importExpression = src.slice(expStart, expEnd)
      const re = /import(?:["'\s]*([\w*{}\n, ]+)from\s*)?["'\s]*([@\w/_-]+)["'\s].*/.exec(
        importExpression,
      )
      const varName = re[2]
      const data = fs.readFileSync(fullPath)
      const code = `const ${varName} = Buffer.from(\`${data.toString('base64')}\`, 'base64');`
      replacementArr.push({ toReplace: importExpression, toAdd: code })

      // console.info(re)
      // console.info(importExpression)
      // console.info(`File found: ${fullPath}`)
    }
  }

  for (const replacement of replacementArr) {
    src = src.replace(replacement.toReplace, replacement.toAdd)
  }
  return src
}

export default options => {
  return {
    name: 'raw-loader',
    async transform(src, id) {
      if (src.includes(marker)) {
        return await transformImports(src, id)
      }
    },
  }
}
