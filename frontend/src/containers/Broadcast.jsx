import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import * as UserActions from '../modules/User';

import * as RoomSocketActions from '../modules/RoomSocket';

import FromServer from '../FromServer';
import Header from '../components/Header';
import RoomControlPanel from '../components/Broadcast/RoomControlPanel';
import Visualizer from '../components/Broadcast/Visualizer';

const Broadcast = (props) => {
  const { user } = FromServer;

  return (
    <div>
      <Header path="broadcast" user={user} />
      <RoomControlPanel {...props} />
      <Visualizer />
    </div>
  );
};

Broadcast.propTypes = {
  roomSocketActions: PropTypes.object.isRequired,
  userActions: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.user,
  roomSocket: state.roomSocket,
});
const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(UserActions, dispatch),
  roomSocketActions: bindActionCreators(RoomSocketActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Broadcast);
