import { EVENTS } from 'sync-api-server/events'
import { AnyCallback } from '../../types'
import { getGlobalTime } from '../../utils'
import { MachineContext } from '../connectionMachine'

const TIME_SYNC_INTERVAL = 1000
const TIME_SYNC_CYCLES = 3
const DEBUG = false

const median = (arr: number[]) => {
  if (arr.length === 0) return 0
  const sorted = arr.sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const syncServerTime =
  (context: MachineContext) => (callback: AnyCallback) => {
    const socket = context.socket
    if (!socket) return callback('syncingError')

    let disableSync = false
    let syncTimeFinished = false
    let underEstimates = [] as number[]
    let overEstimates = [] as number[]
    let underEstimate = 0
    let overEstimate = 0

    socket.on(EVENTS.TIME_SYNC_BACKWARD, (serverTime: number) => {
      const underEstimateLatest = serverTime - getGlobalTime()
      underEstimates.push(underEstimateLatest)
      underEstimate = median(underEstimates)
      const correction = (underEstimate + overEstimate) / 2
      callback({ type: 'updateCorrection', correction })
      if (DEBUG)
        console.log(
          `%c New correction time is ${correction} seconds`,
          'color:red; font-size:12px'
        )
    })
    socket.on(EVENTS.TIME_SYNC_FORWARD, (diff: number) => {
      const overEstimateLatest = diff
      overEstimates.push(overEstimateLatest)
      overEstimate = median(overEstimates)
      const correction = (underEstimate + overEstimate) / 2
      callback({ type: 'updateCorrection', correction })
      if (syncTimeFinished) callback('syncingFinished')

      if (DEBUG)
        console.log(
          `%c New correction time is ${correction} seconds`,
          'color:blue; font-size:12px'
        )
    })
    const syncTime = async () => {
      for (let i = 0; i < TIME_SYNC_CYCLES; i++) {
        if (disableSync) return
        await delay(TIME_SYNC_INTERVAL)
        socket.emit(EVENTS.TIME_SYNC_BACKWARD)
        await delay(TIME_SYNC_INTERVAL)
        socket.emit(EVENTS.TIME_SYNC_FORWARD, getGlobalTime())
      }
      syncTimeFinished = true
    }
    syncTime()

    return () => {
      disableSync = true
      socket.off(EVENTS.TIME_SYNC_BACKWARD)
      socket.off(EVENTS.TIME_SYNC_FORWARD)
    }
  }
