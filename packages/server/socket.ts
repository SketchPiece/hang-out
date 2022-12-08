import { Server, Socket } from 'socket.io'
import { EVENTS } from './events'
import { VideoState } from './types'

const VIDEO_SOURCE = 'http://localhost:3000/vid.mp4?t=4234234'

const THRESH_IGNORANCE = 1

const createVideoState = (steam: string): VideoState => ({
  videoTimestamp: 0,
  playing: false,
  isLoading: false,
  streamUrl: steam,
  lastUpdated: 0
})

const timestampNow = () => Date.now() / 1000

let videoState = createVideoState(VIDEO_SOURCE)
let usersReady = new Map<string, boolean>()

const connection = (socket: Socket) => {
  usersReady.set(socket.id, true)
  console.log('a user connected', socket.id)

  socket.emit(EVENTS.UPDATE_STATE_FROM_SERVER, videoState)
}

const disconnection = (socket: Socket) => {
  usersReady.delete(socket.id)
  console.log('user disconnected', socket.id)
}

const syncTime = (socket: Socket) => {
  socket.on(EVENTS.TIME_SYNC_BACKWARD, () => {
    socket.emit(EVENTS.TIME_SYNC_BACKWARD, timestampNow())
  })
  socket.on(EVENTS.TIME_SYNC_FORWARD, (timestamp: number) => {
    socket.emit(EVENTS.TIME_SYNC_FORWARD, timestampNow() - timestamp)
  })
}

export const createSocketServer = (server: any) => {
  const io = new Server(server)
  io.on('connection', socket => {
    connection(socket)
    syncTime(socket)
    socket.on(EVENTS.READY, newState => {
      usersReady.set(socket.id, true)
      const allReady = Array.from(usersReady.values()).every(
        ready => ready === true
      )
      console.log(usersReady.entries())
      console.log(socket.id, 'can play', allReady, videoState.isLoading)

      if (allReady && videoState.isLoading) {
        console.log('all ready, playing')
        videoState = { ...newState, playing: true, isLoading: false }
        io.emit(EVENTS.UPDATE_STATE_FROM_SERVER, videoState)
      }
    })
    socket.on(EVENTS.NOT_READY, newState => {
      usersReady.set(socket.id, false)
      console.log(socket.id, 'waiting')

      videoState = newState

      io.emit(EVENTS.UPDATE_STATE_FROM_SERVER, newState)
    })

    socket.on(EVENTS.UPDATE_STATE_FROM_CLIENT, (potentialState: VideoState) => {
      console.log('NEW STATE', potentialState)
      const isTooSoon =
        timestampNow() - videoState.lastUpdated < THRESH_IGNORANCE
      const isOtherUser = potentialState.clientId !== videoState.clientId
      const urlDiff = potentialState.streamUrl !== videoState.streamUrl
      const stale = potentialState.lastUpdated < videoState.lastUpdated
      // console.log({ isTooSoon, isOtherUser, urlDiff, stale })
      if ((isTooSoon && isOtherUser) || stale) return
      if (urlDiff) {
        videoState = createVideoState(potentialState.streamUrl)
        return socket.emit(EVENTS.UPDATE_STATE_FROM_SERVER, videoState)
      }
      videoState = potentialState
      console.log('send new state')
      io.emit(EVENTS.UPDATE_STATE_FROM_SERVER, videoState)
    })
    socket.on('disconnect', () => disconnection(socket))
  })
  return io
}
