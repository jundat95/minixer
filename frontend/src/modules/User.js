import _ from 'lodash';

const SET_INFO = 'user/set_info';

const initialState = {
  id: null,
  name: null,
  token: null,
  roomId: null,
  isAdminUser: false,
};

export default function user(state = initialState, action) {
  const { type } = action;
  const newState = _.cloneDeep(state);
  switch (type) {
    case SET_INFO:
      newState.id = action.id;
      newState.name = action.name;
      newState.token = action.token;
      newState.roomId = action.roomId;
      newState.isAdminUser = action.isAdminUser;
      return newState;
    default:
      return state;
  }
}

export function setUser(data) {
  return Object.assign({
    type: SET_INFO,
  }, data);
}
