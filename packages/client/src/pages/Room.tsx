import { useMachine } from '@xstate/react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Chat } from '../components/Chat/Chat'
import { LinkInput } from '../components/LinkInput'

import { VideoPlayer } from '../components/VideoPlayer'
import { useVideoSync } from '../hooks/useVideoSync'
import { connectionMachine } from '../machines/connectionMachine'

export const Room = () => {
  const { roomId } = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [connection] = useMachine(connectionMachine, {
    context: { uri: 'ws://localhost:8080', roomId }
  })

  const socket = connection.context.socket
  const correction = connection.context.timeCorrection

  const { videoProps, updateVideoSource } = useVideoSync({
    socket,
    correction,
    videoRef
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <LinkInput onChange={updateVideoSource} />
      </div>
      <div className="flex gap-3">
        <VideoPlayer ref={videoRef} width="800px" muted {...videoProps} />
        <Chat />
      </div>
    </div>
  )
}
