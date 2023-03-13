import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Create, Param } from '../../store'
import data from '../../resources/history/Wireway/Test.json'


export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

declare type Node = {
  productId: number | string
  ownerId: number | string
  transformation: Transform
  name?: string
  options?: { ident?: string }
}

declare type Expression = {
  partId: number | string
  members: {
    name: string
    value: number
  }[]
}

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  let root = 0
  for (const command of data.buerli) {
    switch (command.method) {
      case 'createRootAssembly':
        root = await api.createRootAssembly('Root', { ident: command.params.ident })
        break;
      case 'loadProductFromUrl':
        await api.loadProductFromUrl(command.params.url, 'ofb', { ident: command.params.ident})
        break;
      case 'addNodes': 
      const nodesToAdd: Node[] = []
        for (const node of command.params.nodes) {
          nodesToAdd.push({
            productId: node.productId,
            ownerId: node.ownerId,
            transformation: [
              node.transformation[0],
              node.transformation[1],
              node.transformation[2]
            ],
          })
        }
        await api.addNodes(...nodesToAdd)
        break;
      case 'setExpressions':
        const expressionsToAdd: Expression[] = []
        for (const expression of command.params.expressions) {
          expressionsToAdd.push({
            partId: expression.partId,
            members: expression.members.map(mem => ({ name: mem.name, value: mem.value}))
          })
        }
        await api.setExpressions(...expressionsToAdd)
        break;
      default:
        console.info('method not found')
        break;
    }
  }
  return root
}

export const cad = new history()

export default { create, paramsMap, cad }
