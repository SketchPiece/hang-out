import { useMachine } from '@xstate/react'
import { Button } from 'flowbite-react'
import throttle from 'lodash.throttle'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react'
import { EVENTS } from 'sync-api-server/events'
import { VideoState } from 'sync-api-server/types'
import { connectionMachine } from './machines/connectionMachine/connectionMachine'
import { getGlobalTime } from './machines/utils'

const PLAYING_THRESH = 1
const PAUSED_THRESH = 0.01

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [connection, send] = useMachine(connectionMachine, {
    context: { uri: 'ws://localhost:8080' }
  })
  const videoState = useRef<VideoState | null>(null)
  const socket = connection.context.socket
  const correction = connection.context.timeCorrection

  useEffect(() => {
    if (!socket) return
    socket.on(EVENTS.UPDATE_STATE_FROM_SERVER, (state: VideoState) => {
      const video = videoRef.current
      if (!video) return
      if (
        video.currentTime === state.videoTimestamp &&
        !video.paused === state.playing &&
        video.src === state.streamUrl
      )
        return
      // if (state.clientId === socket.id) return

      console.log('State from server', state)
      videoState.current = state
      if (video.src !== state.streamUrl) {
        console.log('New stream url', state.streamUrl, video.src)
        video.pause()
        video.src = state.streamUrl
        video.load()
      }

      const proposedTime = state.playing
        ? state.videoTimestamp - state.lastUpdated + getGlobalTime(correction)
        : state.videoTimestamp
      const gap = Math.abs(proposedTime - video.currentTime)

      console.log(
        `%cGap was ${proposedTime - video.currentTime}`,
        'font-size:12px; color:purple'
      )

      if (state.playing) {
        if (gap > PLAYING_THRESH) video.currentTime = proposedTime

        video.play()
      } else {
        video.pause()

        if (gap > PAUSED_THRESH) video.currentTime = proposedTime
      }
    })
    return () => {
      socket.off(EVENTS.UPDATE_STATE_FROM_SERVER)
    }
  }, [socket, correction])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSeek = useCallback(
    throttle((event: SyntheticEvent<HTMLVideoElement>) => {
      console.log('onSeek')
      const video = videoRef.current!
      if (!event || !videoState.current || !socket) return

      const lastUpdated = getGlobalTime(correction)
      console.log(event.type)
      const newState: VideoState = {
        ...videoState.current,
        lastUpdated,
        isLoading: false,
        videoTimestamp: video.currentTime,
        playing:
          event.type === 'seeked' && videoState.current.playing
            ? true
            : event.type === 'play',
        clientId: socket.id
      }
      socket.emit(EVENTS.UPDATE_STATE_FROM_CLIENT, newState)
    }, 200),
    [correction, socket]
  )

  const handleCanPlay = () => {
    console.log('READY')
    if (!socket) return
    const video = videoRef.current!
    const lastUpdated = getGlobalTime(correction)
    const newState: VideoState = {
      ...videoState.current!,
      lastUpdated,
      videoTimestamp: video.currentTime,
      playing: true,
      clientId: socket.id
    }
    socket?.emit(EVENTS.READY, newState)
  }

  const handleWaiting = () => {
    console.log('waiting')

    if (!socket) return

    const video = videoRef.current!
    const lastUpdated = getGlobalTime(correction)
    const newState: VideoState = {
      ...videoState.current!,
      lastUpdated,
      playing: false,
      isLoading: true,
      videoTimestamp: video.currentTime,
      clientId: socket.id
    }
    socket?.emit(EVENTS.NOT_READY, newState)
  }

  const handlePlay = () => {
    console.log('PLAY')
    if (!socket) return
    const video = videoRef.current!
    const lastUpdated = getGlobalTime(correction)
    const newState: VideoState = {
      ...videoState.current!,
      lastUpdated,
      videoTimestamp: video.currentTime,
      playing: true,
      clientId: socket.id
    }
    socket.emit(EVENTS.UPDATE_STATE_FROM_CLIENT, newState)
  }

  const handlePause = () => {
    console.log('PAUSED')

    if (!socket) return
    const video = videoRef.current!
    const lastUpdated = getGlobalTime(correction)
    const newState: VideoState = {
      ...videoState.current!,
      lastUpdated,
      videoTimestamp: video.currentTime,
      playing: false,
      clientId: socket.id
    }
    socket.emit(EVENTS.UPDATE_STATE_FROM_CLIENT, newState)
  }

  return (
    <div>
      <h1 className="text-5xl">Video Sync</h1>
      {/* <pre>
        <code>{JSON.stringify(connection.value, null, 2)}</code>
        <br />
        <code>{JSON.stringify(state.context, null, 2)}</code>
      </pre> */}
      <button
        onClick={() =>
          send('emit', {
            event: EVENTS.UPDATE_STATE_FROM_CLIENT,
            data: { test: 1 }
          })
        }
      >
        {' '}
        click
      </button>
      <video
        width="560"
        height="420"
        ref={videoRef}
        controls
        onSeeked={handleSeek}
        onEnded={handlePause}
        muted
      ></video>

      {/* <Button.Group> */}
      <Button onClick={handlePlay}>Start</Button>
      <Button onClick={handlePause}>Pause</Button>
      <div>
        <button onClick={handleWaiting}>LOAD MORE</button>
        <button onClick={handleCanPlay}>CAN PLAY</button>
      </div>
      {/* </Button.Group> */}
    </div>
  )
}

export default App
