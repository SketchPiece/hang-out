export interface VideoState {
  videoTimestamp: number
  playing: boolean
  isLoading: boolean
  lastUpdated: number
  streamUrl: string
  clientId?: string
}

export interface User {
  username: string
  ready: boolean
}

export interface RoomState {
  videoState: VideoState
  users: Record<string, User>
}
