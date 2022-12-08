import { Socket } from 'socket.io-client'
import { assign, createMachine } from 'xstate'
import { forwardTo } from 'xstate/lib/actions'
import { connectSocket, syncServerTime } from './services'

export interface MachineContext {
  uri: string
  socket: Socket | null
  timeCorrection: number
}

type MachineEvents =
  | { type: 'socketConnected'; socket: Socket }
  | { type: 'socketReconnected'; socket: Socket }
  | { type: 'updateCorrection'; correction: number }
  | { type: 'emit'; event: string; data: any }
  | { type: 'socketDisconnected' }
  | { type: 'syncingFinished' }
  | { type: 'syncingError' }

export const connectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7dZkBcCWGAdHunvgIYA2eAXiVAMSyrIDWYOAwhlrpANoAGALqJQAB1SwyBdGJAAPRAEZlAdkIBOAEzaAzHoAcmzWuUBWI2oA0IAJ6IAtMr0blhweeWaAbABZBH21zP0MAXzDbNExsfCJo3hxIJhZ2HAARPFgE2IEReUlpOLkkRUQfNUFCPU1LSz9tM09tWwcEZx1CQ26-C21TZu0fCKieWNlCHL4IBjAAWzIhUVLCmQx5JQQ-Sq0+nx9DH1UDvVanAx8utR1Dc0FDxqC-EZAp4smx6cJYO3RkegAKng5mAmL9-ugoABRABOMNQMKWBSkaxKoE210uumaoUMegOPlO9hUaj0hG03h85nMxm82j8Bhebwmb0g33BgOBoJ+f3oADESFkABZ5ZYSFHFDaITFaAKmI4eQRmM7tKqVQkM7zXNT7a5Mz7vVkQdm8yFAkEMACu4gg5CS3Dh4wwSJWEtkUoQrkMhEEQ0qpMEDVC+JV2l9hB15k0vsargOOn1MVwEwgWSNKTYHAAStgDaLkUV3aVNlTNIR3NtTP1An5zDZie09EqtOYqZH9vdlMEIpEQOhUBA4PJmetXYXR+inN1y-dNKpBL7DH4jkS2o5tmTXJo9MoAtW-LVE4kJoKKNQ6JCC6iPeuqspZ-PF8uXCrnBZCLWamp9CZerW1EeTroB8SZJBAV6SsWiAGFUvoVEqTZBniPivr4EZ6LomjdGYZg+FhgHJvEebGjyEJQOaYAQUWk5bHo5g+h4DJqCEajMUur4aPo+g1rWC4UoImgEYaxGEPgIIAMrgpAVETmUCD3ruPrmBSUYmAYB6vmS9LYaoDRhmYdx6EJLIiWJYCSX8sLwjCMlonJCkaEYdGqF295HC0DbqNo5KUspniKoERm9iOwGptkxG2R6mgBF094IVGS67por7eGS3RLoGHisdszE9mEQA */
  createMachine(
    {
      context: { socket: null, uri: '', timeCorrection: 0 },
      tsTypes: {} as import('./connectionMachine.typegen').Typegen0,
      schema: { events: {} as MachineEvents, context: {} as MachineContext },
      predictableActionArguments: true,
      invoke: {
        src: 'connect',
        id: 'socket'
      },
      id: 'connection',
      initial: 'initializing',
      states: {
        initializing: {
          on: {
            socketConnected: {
              target: 'connected',
              actions: 'handleConnection'
            }
          }
        },
        connected: {
          initial: 'syncingTime',
          states: {
            syncingTime: {
              invoke: {
                src: 'syncServerTime',
                id: 'syncTime'
              },
              on: {
                syncingError: {
                  target: 'timeSyncError'
                },
                syncingFinished: {
                  target: 'timeSynced'
                },
                updateCorrection: {
                  actions: 'updateCorrection'
                }
              }
            },
            timeSynced: {},
            timeSyncError: {}
          },
          on: {
            socketDisconnected: {
              target: 'disconnected'
            },
            emit: {
              actions: 'emitToSocket'
            }
          }
        },
        disconnected: {
          on: {
            socketReconnected: {
              target: 'connected',
              actions: 'handleConnection'
            }
          }
        }
      }
    },
    {
      services: {
        connect: connectSocket,
        syncServerTime: syncServerTime
      },
      actions: {
        handleConnection: assign({
          socket: (_, event) => {
            return event.socket
          }
        }),
        updateCorrection: assign({
          timeCorrection: (_, event) => {
            return event.correction
          }
        }),
        emitToSocket: forwardTo('socket')
      }
    }
  )
