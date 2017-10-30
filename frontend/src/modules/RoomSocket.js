import _ from 'lodash';

import SocketService from '../services/SocketService';
import Util from '../Util';

const CONNECT = 'room_socket/connect';
const DISCONNECT = 'room_socket/disconnect';
const EMIT_EVENT = 'room_socket/emit_event';
const EMIT_ERROR = 'room_socket/emit_error';
const RECEIVE_EVENT = 'room_socket/receive_event';

const EVENT_ROOM_JOIN = 'room_join';
const EVENT_ROOM_EMOTION = 'room_emotion';
const EVENT_ROOM_EXTEND = 'room_extend';
const EVENT_ROOM_END = 'room_end';
const EVENT_ROOM_TERMINATE = 'room_terminate';
const EVENT_ERROR = 'error';

const handleReceivedEvent = (state, payload) => {
  const { eventType } = payload;
  const newState = _.cloneDeep(state);

  switch (eventType) {
    case EVENT_ROOM_JOIN: {
      newState.isRoomOpen = true;
      const room = payload.room;
      newState.name = room.name;
      newState.maxUserCount = room.max_member_count;
      newState.currentUserCount = room.current_member_count;
      newState.expire = room.expire;
      newState.endTime = room.accessed_at + room.expire;
      newState.extendCount = room.extend_count;
      newState.startTime = room.created_at;
      newState.diffTime = Util.getTimestamp() - room.accessed_at;
      newState.isRoomMaster = payload.is_room_master;
      return newState;
    }
    case EVENT_ROOM_EXTEND: {
      const room = payload.room;
      newState.expire = room.expire;
      newState.endTime = room.accessed_at + room.expire;
      newState.extendCount = room.extend_count;
      newState.startTime = room.created_at;
      newState.diffTime = Util.getTimestamp() - room.accessed_at;
      return newState;
    }
    case EVENT_ROOM_END:
    case EVENT_ROOM_TERMINATE:
      newState.isRoomOpen = false;
      return newState;
    case EVENT_ERROR:
      newState.isReceiveError = true;
      newState.lastErrorReason = payload.reason;
      return newState;
    default:
      return state;
  }
};

const initialState = {
  isConnected: false,
  isRoomOpen: false,
  isRoomMaster: false,
  name: '',
  maxUserCount: 0,
  currentUserCount: 0,
  emotionCountById: {},
  extendCount: 0,
  endTime: 0,
  expire: 0,
  startTime: 0,
  diffTime: 0,
  isEmitError: false,
  isReceiveError: false,
  lastErrorReason: null,
};

export default function roomSocket(state = initialState, action) {
  const { type } = action;
  const newState = _.cloneDeep(state);

  switch (type) {
    case CONNECT: {
      newState.isConnected = true;
      return newState;
    }
    case DISCONNECT: {
      newState.isConnected = false;
      return newState;
    }
    case RECEIVE_EVENT: {
      return handleReceivedEvent(state, action.payload);
    }
    case EMIT_EVENT: {
      newState.isEmitError = false;
      newState.lastErrorReason = null;
      return newState;
    }
    case EMIT_ERROR: {
      newState.isEmitError = true;
      newState.lastErrorReason = action.reason;
      return newState;
    }
    default:
      return state;
  }
}

export function setReceiveEvent() {
  return (dispatch) => {
    [
      EVENT_ROOM_JOIN,
      EVENT_ROOM_EXTEND,
      EVENT_ROOM_EMOTION,
      EVENT_ROOM_END,
      EVENT_ROOM_TERMINATE,
      EVENT_ERROR,
    ].forEach((eventType) => {
      SocketService.on(eventType, (data) => {
        const payload = Object.assign({}, { eventType }, data);
        dispatch({ type: RECEIVE_EVENT, payload });
      });
    });
  };
}

export function connect() {
  SocketService.connect();
  return { type: CONNECT };
}

export function emit(type, data) {
  return (dispatch) => {
    dispatch({ type: EMIT_EVENT });
    SocketService.emit(type, data, (response) => {
      if (response.result === false) {
        dispatch({ type: EMIT_ERROR, reason: response.reason });
      }
    });
  };
}

export function disconnect() {
  SocketService.disconnect();
  return {
    type: DISCONNECT,
  };
}
