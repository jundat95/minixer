import _ from 'lodash';

const SET_STATE = 'room_control/set_state';

const initialState = {
  sourceList: {},
  deviceId: '',
  bitRate: 192,
  inputGain: 100,
  outputGain: 100,
  isCapture: false,
  isMute: false,
  visualizerColor: 'red',
};

export default function user(state = initialState, action) {
  const { type } = action;
  const newState = _.cloneDeep(state);
  switch (type) {
    case SET_STATE: {
      const { key, value } = action;
      if (state[key] === undefined) {
        return state;
      }
      newState[key] = value;
      return newState;
    }
    default:
      return state;
  }
}

export function setState(key, value) {
  return {
    type: SET_STATE,
    key,
    value,
  };
}
