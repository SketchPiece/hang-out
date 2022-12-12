import throttle from 'lodash.throttle'
import {
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef
} from 'react'
import { Socket } from 'socket.io-client'
import { EVENT } from 'sync-api-server/events'
import { VideoState } from 'sync-api-server/types'
import { getGlobalTime } from '../machines/utils'

const PLAYING_THRESH = 1
const PAUSED_THRESH = 0.01

interface VideoSyncHook {
  socket: Socket | null
  correction: number
  videoRef: MutableRefObject<HTMLVideoElement | null>
}

export const useVideoSync = ({
  socket,
  correction,
  videoRef
}: VideoSyncHook) => {
  const videoState = useRef<VideoState | null>(null)

  useEffect(() => {
    if (!socket) return
    socket.on(EVENT.UPDATE_STATE_FROM_SERVER, (state: VideoState) => {
      const video = videoRef.current
      if (!video) return
      if (
        video.currentTime === state.videoTimestamp &&
        !video.paused === state.playing &&
        video.src === state.streamUrl
      )
        return

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
      socket.off(EVENT.UPDATE_STATE_FROM_SERVER)
    }
  }, [socket, correction, videoRef])

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
      socket.emit(EVENT.UPDATE_STATE_FROM_CLIENT, newState)
    }, 200),
    [correction, socket]
  )

  const handleCanPlay = () => {
    console.log('CanPlay')
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
    socket?.emit(EVENT.READY, newState)
  }

  const handleWaiting = () => {
    console.log('Waiting')

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
    socket?.emit(EVENT.NOT_READY, newState)
  }

  const handlePlay = () => {
    if (!socket) return
    const video = videoRef.current!
    console.log(video)
    const lastUpdated = getGlobalTime(correction)
    const newState: VideoState = {
      ...videoState.current!,
      lastUpdated,
      videoTimestamp: video.currentTime,
      playing: true,
      clientId: socket.id
    }
    socket.emit(EVENT.UPDATE_STATE_FROM_CLIENT, newState)
  }

  const handlePause = () => {
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
    socket.emit(EVENT.UPDATE_STATE_FROM_CLIENT, newState)
  }

  const updateVideoSource = (url: string) => {
    if (!socket) return

    const newState: VideoState = { ...videoState.current!, streamUrl: url }
    socket.emit(EVENT.UPDATE_STATE_FROM_CLIENT, newState)
  }

  return {
    videoProps: {
      onSeeked: handleSeek,
      onCanPlay: handleCanPlay,
      onWaiting: handleWaiting,
      onPlayClick: handlePlay,
      onPauseClick: handlePause,
      onEnded: handlePause
    },
    updateVideoSource
  }
}
