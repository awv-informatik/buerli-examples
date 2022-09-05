import { useEffect } from 'react'
import { createClient } from '@liveblocks/client'
import { middleware } from '@liveblocks/zustand'
import create from 'zustand'

const client = createClient({ publicApiKey: 'pk_live_U6LmOYf1xVSUvCB1_t7EE7Vy' })

const useStore = create(
  middleware(
    (set) => ({
      cursor: [0, 0],
      matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      setCursor: (cursor) => set({ cursor }),
      setMatrix: (matrix) => set({ matrix })
    }),
    {
      client,
      presenceMapping: { cursor: true },
      storageMapping: { matrix: true }
    }
  )
)

const Room = ({ id = 'buerli-meta-3', children }) => {
  const {
    liveblocks: { enterRoom, leaveRoom }
  } = useStore()

  useEffect(() => {
    enterRoom(id, {
      matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    })
    return () => leaveRoom(id)
  }, [enterRoom, leaveRoom])

  return children
}

export { Room, useStore }
