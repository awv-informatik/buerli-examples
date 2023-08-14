import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Create, Param } from '../../store'
import data from '../../resources/history/Wemonte3.json'
import arraybuffer from '../../resources/history/Wemonte.ofb'


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

declare type Command = {
  method: string;
  params: {
    type: string;
    ident: string;
    expressions?: {
      partIdent: number | string
      members: {
        name: string
        value: number
      }[]
    }[]
    url?: string,
    nodes?: {
      productIdent: string,
      ownerIdent: string,
      transformation: Transform
    }[]
  }
}

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  let root = 0
  for (const command of data.buerli as Command[]) {
    switch (command.method) {
      case 'createRootAssembly':
        root = await api.createRootAssembly('Assembly', { ident: command.params.ident })
        break;
      case 'load':
        [root] = await api.load(arraybuffer, command.params.type as 'ofb' | 'stp', { ident: command.params.ident })
        break;
      case 'loadFromUrl':
        [root] = await api.loadFromUrl(command.params.url, 'ofb', { ident: command.params.ident})
        break;
      case 'loadProductFromUrl':
        await api.loadProductFromUrl(command.params.url, 'ofb', { ident: command.params.ident})
        break;
      case 'addNodes': 
      const nodesToAdd: Node[] = []
        for (const node of command.params.nodes) {
          nodesToAdd.push({
            productId: node.productIdent,
            ownerId: node.ownerIdent,
            transformation: [
              node.transformation[0],
              node.transformation[1],
              node.transformation[2]
            ],
          })
        }
        await api.addInstances(...nodesToAdd)
        break;
      case 'setExpressions':
        const expressionsToAdd: Expression[] = []
        for (const expression of command.params.expressions) {
          expressionsToAdd.push({
            partId: expression.partIdent,
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
