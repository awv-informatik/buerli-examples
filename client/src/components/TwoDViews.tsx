import { CCClasses, ccUtils } from '@buerli.io/classcad'
import { DrawingID, getDrawing, ObjectID, ArrayMem } from '@buerli.io/core'
import { useDrawing } from '@buerli.io/react'
import React from 'react'

export const TwoDViews: React.FC<{
  drawingId: DrawingID
}> = ({ drawingId }) => {
  const rootId = useDrawing(drawingId, state => state.structure.root)
  const rootChildrenIds = useDrawing(drawingId, d => d.structure.tree[rootId]?.children)

  const viewSetId = React.useMemo(() => {
    const drawing = getDrawing(drawingId)
    const tree = drawing && drawing.structure.tree
    for (const child of rootChildrenIds || []) {
      if (ccUtils.base.isA(tree[child]?.class, CCClasses.CCViewSet)) {
        return child
      }
    }
    return null
  }, [drawingId, rootChildrenIds])

  const viewIds = useDrawing(drawingId, d => d.structure.tree[viewSetId]?.children)

  React.useEffect(() => {
    viewIds && console.info('View Ids: ', ...viewIds)
  }, [viewIds])

  return (
    <>
      {viewIds?.map(viewId => (
        <TwoDView key={viewId} drawingId={drawingId} viewId={viewId} />
      ))}
    </>
  )
}

export default TwoDViews

const TwoDView: React.FC<{
  drawingId: DrawingID
  viewId: ObjectID
}> = ({ drawingId, viewId }) => {
  const { dimensionSetId } = React.useMemo(() => {
    const drawing = getDrawing(drawingId)
    const tree = drawing && drawing.structure.tree
    const [dimSetId] = viewId && ccUtils.base.getChildren(viewId, CCClasses.CCDimensionSet, tree)
    return { dimensionSetId: dimSetId }
  }, [drawingId])

  const dimensionIds = useDrawing(drawingId, d => d.structure.tree[dimensionSetId]?.children)
  React.useEffect(() => {
    dimensionIds && console.info('Dimension Ids: ', ...dimensionIds)
  }, [dimensionIds])

  const entities = useDrawing(
    drawingId,
    d => (d.structure.tree[viewId]?.members.projections as ArrayMem)?.members,
  )
  const entityIds = React.useMemo(() => entities.map(ent => ent.value as number), [entities])
  React.useEffect(() => {
    entityIds && console.info('Entity Ids: ', ...entityIds)
  }, [entityIds])

  return (
    <>
      {entityIds?.map(entId => (
        <Edge key={entId} drawingId={drawingId} entityId={entId} />
      ))}
      {dimensionIds?.map(dimId => (
        <Dimension key={dimId} drawingId={drawingId} dimensionId={dimId} />
      ))}
    </>
  )
}

const Edge: React.FC<{ drawingId: DrawingID; entityId: ObjectID }> = ({ drawingId, entityId }) => {
  const entity = useDrawing(drawingId, d => d.geometry.cache[entityId])
  React.useEffect(() => {
    entity && console.info('Geometry: ', entity)
  }, [entity])

  return <></>
}

const Dimension: React.FC<{ drawingId: DrawingID; dimensionId: ObjectID }> = ({ drawingId, dimensionId }) => {
  const dimension = useDrawing(drawingId, d => d.structure.tree[dimensionId])
  React.useEffect(() => {
    dimension && console.info('Dimension: ', dimension)
  }, [dimension])

  return <></>
}
