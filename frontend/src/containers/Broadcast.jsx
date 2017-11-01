import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import * as UserActions from '../modules/User';
import * as RoomSocketActions from '../modules/RoomSocket';
import * as RoomControlActions from '../modules/RoomControl';

import FromServer from '../FromServer';
import Header from '../components/Header';
import Room from '../components/Broadcast/Room';
import Visualizer from '../components/Broadcast/Visualizer';

const Broadcast = (props) => {
  const { user } = FromServer;
  const user2 = user === null ? {} : user;

  return (
    <div>
      <Header path="broadcast" user={user2} />
      <Room {...props} />
      <Visualizer {...props} />
    </div>
  );
};

Broadcast.propTypes = {
  roomSocketActions: PropTypes.object.isRequired,
  userActions: PropTypes.object.isRequired,
  roomControl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
  roomSocket: state.roomSocket,
  roomControl: state.roomControl,
});
const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(UserActions, dispatch),
  roomSocketActions: bindActionCreators(RoomSocketActions, dispatch),
  roomControlActions: bindActionCreators(RoomControlActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Broadcast);
