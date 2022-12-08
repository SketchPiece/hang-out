// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.socket": {
      type: "done.invoke.socket";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.syncTime": {
      type: "done.invoke.syncTime";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.socket": { type: "error.platform.socket"; data: unknown };
    "error.platform.syncTime": {
      type: "error.platform.syncTime";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    connect: "done.invoke.socket";
    syncServerTime: "done.invoke.syncTime";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    emitToSocket: "emit";
    handleConnection: "socketConnected" | "socketReconnected";
    updateCorrection: "updateCorrection";
  };
  eventsCausingServices: {
    connect: "xstate.init";
    syncServerTime: "socketConnected" | "socketReconnected";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | "connected"
    | "connected.syncingTime"
    | "connected.timeSyncError"
    | "connected.timeSynced"
    | "disconnected"
    | "initializing"
    | { connected?: "syncingTime" | "timeSyncError" | "timeSynced" };
  tags: never;
}
