import { io } from 'socket.io-client'
import type { EventObject, Receiver } from 'xstate'
import type { AnyCallback } from '../../types'
import type { MachineContext } from '../connectionMachine'

export const connectSocket =
  (context: MachineContext) =>
  (callback: AnyCallback, onReceive: Receiver<EventObject>) => {
    const socket = io(context.uri, {
      transports: ['websocket']
    })
    console.log('CONNECT SOCKET')
    socket.on('connect', () => {
      callback({ type: 'socketConnected', socket })
      callback({ type: 'socketReconnected', socket })
    })

    socket.on('disconnect', () => {
      callback('socketDisconnected')
    })

    onReceive(event => {
      if (event.type === 'emit') {
        console.log('emit', event)
      }
    })

    return () => {
      console.log('DISCONNECT SOCKET')
      socket.disconnect()
      callback('socketDisconnected')
    }
  }
