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
const EVENT_ERROR = 'error';

const handleReceivedEvent = (state, payload) => {
  const { eventType } = payload;
  const newState = _.cloneDeep(state);

  switch (eventType) {
    case EVENT_ROOM_JOIN:
      newState.isRoomOpen = true;
      newState.maxUserCount = payload.maxUserCount;
      newState.currentUserCount = payload.currentUserCount;
      newState.emotionCountById = payload.emotionCountById;
      newState.endTime = payload.endTime;
      newState.diffTime = Util.getTimestamp() - payload.currentTime;
      newState.name = payload.name;
      newState.broadcastList = [];
      return newState;
    case EVENT_ROOM_EMOTION:
      newState.emotionCountById = payload.emotionCountById;
      return newState;
    case EVENT_ROOM_EXTEND:
      newState.remainTime = payload.remainTime;
      return newState;
    case EVENT_ROOM_END:
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
  name: '',
  maxUserCount: 0,
  currentUserCount: 0,
  emotionCountById: {},
  endTime: 0,
  diffTime: 0,
  isEmitError: false,
  isReceiveError: false,
  lastErrorReason: null,
  broadcastList: [],
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

export function connect() {
  return (dispatch) => {
    [
      EVENT_ROOM_JOIN,
      EVENT_ROOM_EXTEND,
      EVENT_ROOM_EMOTION,
      EVENT_ERROR,
    ].forEach((eventType) => {
      SocketService.on(eventType, (data) => {
        const payload = Object.assign({}, { eventType }, data);
        dispatch({ type: RECEIVE_EVENT, payload });
      });
    });

    SocketService.connect();
    dispatch({ type: CONNECT });
  };
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
