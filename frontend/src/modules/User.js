import _ from 'lodash';

const SET_INFO = 'user/set_info';

const initialState = {
  id: null,
  name: null,
  token: null,
};

export default function user(state = initialState, action) {
  const { type } = action;
  const newState = _.cloneDeep(state);
  switch (type) {
    case SET_INFO:
      newState.id = action.id;
      newState.name = action.name;
      newState.token = action.token;
      return newState;
    default:
      return state;
  }
}

export function setUser(id, name, token) {
  return {
    type: SET_INFO,
    id,
    name,
    token,
  };
}
