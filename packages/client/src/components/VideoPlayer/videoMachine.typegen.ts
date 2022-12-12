// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'xstate.after(1000)#videoMachine.hoverState.hovered.mouseOut': {
      type: 'xstate.after(1000)#videoMachine.hoverState.hovered.mouseOut'
    }
    'xstate.after(3000)#videoMachine.hoverState.hovered.mouseIn.mouseControlsOut': {
      type: 'xstate.after(3000)#videoMachine.hoverState.hovered.mouseIn.mouseControlsOut'
    }
    'xstate.init': { type: 'xstate.init' }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: 'pause' | 'play'
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    pause: 'pause'
    play: 'play'
    updateProgress: 'updateProgress'
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {}
  matchesStates:
    | 'fullscreen'
    | 'fullscreen.active'
    | 'fullscreen.inactive'
    | 'hoverState'
    | 'hoverState.hovered'
    | 'hoverState.hovered.hide'
    | 'hoverState.hovered.mouseIn'
    | 'hoverState.hovered.mouseIn.mouseControlsIn'
    | 'hoverState.hovered.mouseIn.mouseControlsOut'
    | 'hoverState.hovered.mouseOut'
    | 'hoverState.notHovered'
    | 'playback'
    | 'playback.muteState'
    | 'playback.muteState.muted'
    | 'playback.muteState.unmuted'
    | 'playback.playState'
    | 'playback.playState.paused'
    | 'playback.playState.playing'
    | {
        fullscreen?: 'active' | 'inactive'
        hoverState?:
          | 'hovered'
          | 'notHovered'
          | {
              hovered?:
                | 'hide'
                | 'mouseIn'
                | 'mouseOut'
                | { mouseIn?: 'mouseControlsIn' | 'mouseControlsOut' }
            }
        playback?:
          | 'muteState'
          | 'playState'
          | {
              muteState?: 'muted' | 'unmuted'
              playState?: 'paused' | 'playing'
            }
      }
  tags: never
}
