export interface VideoState {
  videoTimestamp: number
  playing: boolean
  isLoading: boolean
  lastUpdated: number
  streamUrl: string
  clientId?: string
}
