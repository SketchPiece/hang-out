import {
  ComponentProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import classNames from 'classnames'
import { useMachine } from '@xstate/react'
import { videoMachine } from './videoMachine'
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { BiFullscreen, BiExitFullscreen } from 'react-icons/bi'
import { Seeker } from './Seeker'

interface VideoPlayerProps extends ComponentProps<'video'> {
  width?: string
  height?: string
  onPlayClick?: () => void
  onPauseClick?: () => void
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      width,
      height,
      onTimeUpdate,
      onCanPlay,
      onEnded,
      onPlayClick,
      onPauseClick,
      muted: mutedProp,
      ...rest
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [state, send] = useMachine(videoMachine, {
      actions: {
        play: () => {
          videoRef.current?.play()
        },
        pause: () => {
          videoRef.current?.pause()
        }
      }
    })

    useImperativeHandle(ref, () => videoRef.current!)
    const videoContainerRef = useRef<HTMLDivElement>(null)

    const playing = state.matches('playback.playState.playing')
    const muted = state.matches('playback.muteState.muted')
    const togglePlay = () => {
      if (playing) onPauseClick ? onPauseClick() : send('pause')
      else onPlayClick ? onPlayClick() : send('play')
    }

    const toggleMute = () => (muted ? send('unmute') : send('mute'))

    const handleFullscreen = () => {
      const videoContainer = videoContainerRef.current!
      if (document.fullscreenElement) {
        send('closeFullscreen')
        document.exitFullscreen()
      } else {
        send('openFullscreen')
        videoContainer.requestFullscreen()
      }
    }

    const handleTimeUpdate = () => {
      if (!videoRef.current) return
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      send({ type: 'updateProgress', value: progress })
    }

    const handleVideoProgress = (progress: number) => {
      if (!videoRef.current) return
      const manualChange = progress
      videoRef.current.currentTime =
        (videoRef.current.duration / 100) * manualChange
      send({ type: 'updateProgress', value: manualChange })
    }

    useEffect(() => {
      if (mutedProp) send('mute')
      else send('unmute')
    }, [mutedProp, send])

    return (
      <div
        ref={videoContainerRef}
        style={{
          width: width || 'auto',
          height: height || 'auto'
        }}
        className={classNames(
          'overflow-hidden rounded-md relative',
          state.matches('hoverState.hovered.hide') && 'cursor-none'
        )}
        onMouseEnter={() => send('mouseEnter')}
        onMouseLeave={() => send('mouseLeave')}
        onMouseMove={() => send('mouseMove')}
        onDoubleClick={handleFullscreen}
      >
        <video
          className="w-full h-full"
          onClick={togglePlay}
          ref={videoRef}
          onTimeUpdate={e => {
            handleTimeUpdate()
            onTimeUpdate && onTimeUpdate(e)
          }}
          onCanPlay={e => {
            handleTimeUpdate()
            onCanPlay && onCanPlay(e)
          }}
          onEnded={e => {
            send('pause')
            onEnded && onEnded(e)
          }}
          onPlay={() => send('play')}
          onPause={() => send('pause')}
          muted={muted}
          {...rest}
        />
        <div
          onMouseEnter={() => send('mouseControlsEnter')}
          onMouseLeave={() => send('mouseControlsLeave')}
          className={classNames(
            'absolute bottom-0 py-3 text-white text-lg flex items-center justify-center gap-5 w-full px-10 backdrop-blur-sm transition-all duration-500',
            state.matches('hoverState.notHovered') ||
              state.matches('hoverState.hovered.hide')
              ? 'opacity-0'
              : 'opacity-100'
          )}
        >
          <button
            className="cursor-pointer transition-transform hover:scale-125"
            onClick={togglePlay}
          >
            {!playing ? <FaPlay /> : <FaPause />}
          </button>
          <Seeker
            value={isNaN(state.context.progress) ? 0 : state.context.progress}
            onChange={handleVideoProgress}
            duration={videoRef.current?.duration}
            currentTime={videoRef.current?.currentTime}
          />
          <button
            className="transition-transform hover:scale-125"
            onClick={toggleMute}
          >
            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <button
            className="transition-transform hover:scale-125 text-xl"
            onClick={handleFullscreen}
          >
            {state.matches('fullscreen.inactive') ? (
              <BiFullscreen />
            ) : (
              <BiExitFullscreen />
            )}
          </button>
        </div>
        {/* <span className="animate-ping-slow absolute inline-flex h-5 w-5 rounded-full bg-sky-400 opacity-75 -top-1 -right-1"></span> */}
      </div>
    )
  }
)
