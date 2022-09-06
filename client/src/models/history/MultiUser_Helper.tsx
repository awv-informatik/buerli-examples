import { createClient } from '@liveblocks/client'
import { middleware } from '@liveblocks/zustand'
import create from 'zustand'

type StoreLiveblock = {
  holesCount: number
  cursor: number[],
  setHolesCount: (holesCount: number) => void
  setCursor: (cursor: number[]) => void,
}

const client = createClient({ publicApiKey: 'pk_live_U6LmOYf1xVSUvCB1_t7EE7Vy' })

const useStoreLiveblocks = create(
  middleware<StoreLiveblock>(
    (set: (arg0: { holesCount?: number; cursor?: number[] }) => any) => ({
      holesCount: 0,
      cursor: [0,0],
      setHolesCount: (holesCount: number) => set({ holesCount }),
      setCursor: (cursor: number[]) => set({ cursor }),
    }),
    {
      client,
      presenceMapping: { cursor: true },
    },
  ),
)

export default useStoreLiveblocks
