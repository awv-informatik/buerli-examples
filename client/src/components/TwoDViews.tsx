import { CCClasses, ccUtils } from '@buerli.io/classcad'
import { DrawingID, getDrawing } from '@buerli.io/core'
import { useDrawing } from '@buerli.io/react'
import React from 'react'

export const TwoDViews: React.FC<{
  drawingId: DrawingID
}> = ({ drawingId }) => {

  // Drawing, structure tree, root
  const drw = getDrawing(drawingId)
  const tree = drw && drw.structure.tree
  const rootId = useDrawing(drawingId, state => state.structure.root)
  if (rootId) {
    console.info('Root Id: ', rootId)

    // Dimensions
    const [dimensionSetId] = rootId && ccUtils.base.getChildren(rootId, CCClasses.CCDimensionSet, tree)
    console.info('DimensionSet Id: ', dimensionSetId)
    const dimensionSet = tree[dimensionSetId]
    console.info('DimensionSet Object: ', dimensionSet)
    const dimensionIds = ccUtils.base.getChildren(dimensionSetId, CCClasses.CCDimension, tree)
    console.info('Dimension Ids: ', ...dimensionIds)
    dimensionIds.forEach(dimId => {
      console.info('Dimension Object: ', tree[dimId])
    });
    
    // 2D views
    const [viewSetId] = rootId && ccUtils.base.getChildren(rootId, CCClasses.CCViewSet, tree)
    console.info('ViewSet Id: ', viewSetId)
    const viewSet = tree[viewSetId]
    console.info('ViewSet Object: ', viewSet)
    const viewIds = ccUtils.base.getChildren(viewSetId, CCClasses.CCView2D, tree)
    console.info('View Ids: ', ...viewIds)
    viewIds.forEach(viewId => {
      console.info('View Object: ', tree[viewId])
    });
  }

  return <></>
}

export default TwoDViews
