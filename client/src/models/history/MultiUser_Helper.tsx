import { useEffect } from 'react'
import { createClient } from '@liveblocks/client'
import { middleware } from '@liveblocks/zustand'
import create from 'zustand'

const gravatars = [
  'https://avatars.githubusercontent.com/u/2223602?v=4',
  'https://avatars.githubusercontent.com/u/1035169?v=4',
  'https://avatars.githubusercontent.com/u/1051509?v=4',
  'https://avatars.githubusercontent.com/u/15867665?v=4',
]

const client = createClient({ publicApiKey: 'pk_live_U6LmOYf1xVSUvCB1_t7EE7Vy' })

const useStore = create(
  middleware(
    set => ({
      cursor: [0, 0],
      holesCount: 6,
      setCursor: (cursor: any) => set({ cursor }),
      setHolesCount: (holesCount: number) => set({ holesCount }),
    }),
    {
      client,
      presenceMapping: { cursor: true },
    },
  ),
)

const Room = ({ id = 'buerli-meta-3', children }) => {
  const {
    liveblocks: { enterRoom, leaveRoom },
  } = useStore()

  useEffect(() => {
    enterRoom(id, {})
    return () => leaveRoom(id)
  }, [enterRoom, leaveRoom])

  return children
}

const Others: React.FC = () => {
  const users = useStore(state => state.liveblocks.others)
  const othersCursors = users.map(user => user.presence?.cursor)
  return othersCursors.map(
    (obj: any[]) =>
      obj && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate3d(${obj[0]}px,${obj[1]}px,0)`,
            display: 'flex',
            alignItems: 'center',
          }}>
          <img style={{ borderRadius: '50%', width: 22, height: 22 }} src={gravatars[0]} />
          <div className="annotation" style={{ marginLeft: 5, padding: '6px 10px' }}>
            xyz
          </div>
        </div>
      ),
  )
}

export { Room, useStore, Others }
