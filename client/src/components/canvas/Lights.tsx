import { DrawingID } from '@buerli.io/core'
import { useDrawing } from '@buerli.io/react'
import React from 'react'

export function Lights({ drawingId }: { drawingId: DrawingID }) {
  const bounds = useDrawing(drawingId, drawing => drawing.geometry.bounds)
  const factor = React.useMemo(() => (bounds ? bounds.radius : 25) * 4, [bounds])
  return factor ? (
    <>
      <ambientLight intensity={0.5} />
      <spotLight
        castShadow
        intensity={1}
        angle={0.5}
        penumbra={1}
        position={[factor / 2, factor / 2, -factor / 2]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        intensity={0.5}
        position={[factor / 2, factor / 2, factor / 2]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  ) : null
}

export default Lights
