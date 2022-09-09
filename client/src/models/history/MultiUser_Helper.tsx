import { createClient } from '@liveblocks/client'
import { middleware } from '@liveblocks/zustand'
import create from 'zustand'

type RoomState = {
  holesCount: number
  setHolesCount: (holesCount: number) => void
  cursor: number[],
  setCursor: (cursor: number[]) => void,
}

type RoomPresence = {
  cursor: number[],
}

const client = createClient({ publicApiKey: 'pk_live_U6LmOYf1xVSUvCB1_t7EE7Vy' })

const useStoreLiveblocks = create(
  middleware<RoomState, RoomPresence>(
    (set) => ({
      holesCount: 0,
      cursor: [0,0],
      setHolesCount: (holesCount: number) => set({ holesCount }),
      setCursor: (cursor: number[]) => set({ cursor }),
    }),
    {
      client,
      presenceMapping: { cursor: true },
      storageMapping: { holesCount: true }
    },
  ),
)

export default useStoreLiveblocks
