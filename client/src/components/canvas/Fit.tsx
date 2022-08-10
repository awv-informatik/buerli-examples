import { Bounds, useBounds } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import React from 'react'
import create, { GetState, SetState } from 'zustand'

type StoreProps = { stamp: number; fit: () => void }
const store = (set: SetState<StoreProps>, get: GetState<StoreProps>): StoreProps => ({
  stamp: 0,
  fit: () => set({ stamp: Date.now() }),
})
export const useFit = create<StoreProps>(store)

/**
 * Fit to scene bounds if the user request by store.fit.
 */
function StampFit() {
  const bounds = useBounds()
  const stamp = useFit(f => f.stamp)

  React.useEffect(() => {
    bounds?.refresh().clip().fit()
  }, [bounds, stamp])

  return null
}

/**
 * Fit to scene bounds if the user double clicks the Canvas.
 */
function DblClick() {
  const bounds = useBounds()
  const gl = useThree(state => state.gl)

  React.useEffect(() => {
    function onDoubleClick() {
      bounds?.refresh().clip().fit()
    }
    gl.domElement.addEventListener('dblclick', onDoubleClick, { passive: true })
    return () => {
      gl.domElement.removeEventListener('dblclick', onDoubleClick)
    }
  }, [bounds, gl.domElement])

  return null
}

/**
 * Fits three scene to its bounds.
 */
export function Fit({ children }: { children?: React.ReactNode }) {
  return (
    <Bounds>
      {children}
      <DblClick />
      <StampFit />
    </Bounds>
  )
}
