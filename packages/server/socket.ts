import { Server, Socket } from 'socket.io'
import { EVENT } from './events'
import { RoomState, VideoState } from './types'
import * as dotenv from 'dotenv'
dotenv.config()

const VIDEO_SOURCE = process.env.HOST_URL + '/vid.mp4?t=4234234'

const THRESH_IGNORANCE = 1

const NO_ROOM = 'global'

interface ExtendedSocket extends Socket {
  currentRoom?: string
}

const createVideoState = (steam: string): VideoState => ({
  videoTimestamp: 0,
  playing: false,
  isLoading: false,
  streamUrl: steam,
  lastUpdated: 0
})

const timestampNow = () => Date.now() / 1000

// let videoState = createVideoState(VIDEO_SOURCE)
const rooms: Record<string, RoomState> = {}
// const usersReady = new Map<string, boolean>()

const connection = (socket: ExtendedSocket) => {
  const room = socket.currentRoom || NO_ROOM
  if (!rooms[room]) {
    rooms[room] = {
      videoState: createVideoState(VIDEO_SOURCE),
      users: {
        [socket.id]: {
          username: '',
          ready: true
        }
      }
    }
  } else {
    rooms[room].users[socket.id] = { username: '', ready: true }
  }
  socket.join(room)
  console.log('a user connected', socket.id)

  console.log('rooms', rooms)

  socket.emit(EVENT.UPDATE_STATE_FROM_SERVER, rooms[room].videoState)
}

const disconnection = (socket: ExtendedSocket) => {
  const room = socket.currentRoom || NO_ROOM
  socket.leave(room)
  delete rooms[room].users[socket.id]
  if (Object.keys(rooms[room].users).length === 0) {
    delete rooms[room]
  }
  console.log('user disconnected', socket.id)
  console.log('rooms', rooms)
}

const syncTime = (socket: ExtendedSocket) => {
  socket.on(EVENT.TIME_SYNC_BACKWARD, () => {
    socket.emit(EVENT.TIME_SYNC_BACKWARD, timestampNow())
  })
  socket.on(EVENT.TIME_SYNC_FORWARD, (timestamp: number) => {
    socket.emit(EVENT.TIME_SYNC_FORWARD, timestampNow() - timestamp)
  })
}

export const createSocketServer = (server: any) => {
  const io = new Server(server)
  io.use((socket: ExtendedSocket, next) => {
    const { room } = socket.handshake.query
    socket.currentRoom = room as string
    return next()
  })
  io.on('connection', (socket: ExtendedSocket) => {
    connection(socket)
    syncTime(socket)
    socket.on(EVENT.READY, newState => {
      const room = socket.currentRoom || NO_ROOM
      const users = rooms[room].users

      users[socket.id] = {
        username: users[socket.id].username,
        ready: true
      }

      const allReady = Object.values(users).every(user => user.ready)

      if (allReady && newState.isLoading) {
        console.log('all ready, playing')
        rooms[room].videoState = {
          ...newState,
          playing: true,
          isLoading: false
        }
        io.to(room).emit(EVENT.UPDATE_STATE_FROM_SERVER, rooms[room].videoState)
      }
    })
    socket.on(EVENT.NOT_READY, newState => {
      console.log(socket.id, 'waiting')
      const room = socket.currentRoom || NO_ROOM

      const users = rooms[room].users
      const user = users[socket.id]
      users[socket.id] = {
        username: user?.username || '',
        ready: false
      }

      rooms[room].videoState = newState

      io.to(room).emit(EVENT.UPDATE_STATE_FROM_SERVER, newState)
    })

    socket.on(EVENT.UPDATE_STATE_FROM_CLIENT, (potentialState: VideoState) => {
      console.log('NEW STATE', potentialState)
      const room = socket.currentRoom || NO_ROOM
      const videoState = rooms[room].videoState

      const isTooSoon =
        timestampNow() - videoState.lastUpdated < THRESH_IGNORANCE
      const isOtherUser = potentialState.clientId !== videoState.clientId
      const urlDiff = potentialState.streamUrl !== videoState.streamUrl
      const stale = potentialState.lastUpdated < videoState.lastUpdated
      // console.log({ isTooSoon, isOtherUser, urlDiff, stale })
      if ((isTooSoon && isOtherUser) || stale) return
      if (urlDiff) {
        rooms[room].videoState = createVideoState(potentialState.streamUrl)
        return socket.emit(
          EVENT.UPDATE_STATE_FROM_SERVER,
          rooms[room].videoState
        )
      }
      rooms[room].videoState = potentialState
      console.log('send new state')
      io.to(room).emit(EVENT.UPDATE_STATE_FROM_SERVER, rooms[room].videoState)
    })
    socket.on('disconnect', () => disconnection(socket))
  })
  return io
}
