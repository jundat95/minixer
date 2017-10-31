import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Thunk from 'redux-thunk';
import { combineReducers, compose, createStore, applyMiddleware } from 'redux';

import Broadcast from '../containers/Broadcast';
import user from '../modules/User';
import roomSocket from '../modules/RoomSocket';
import roomControl from '../modules/RoomControl';

const reducers = combineReducers({
  user,
  roomSocket,
  roomControl,
});
const finalCreateStore = compose(applyMiddleware(Thunk))(createStore);
const store = finalCreateStore(reducers);

render(<Provider store={store}><Broadcast /></Provider>, document.getElementById('react-content'));
