import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import * as UserActions from '../modules/User';

import * as RoomSocketActions from '../modules/RoomSocket';

import FromServer from '../FromServer';
import Header from '../components/Header';
import RoomControlPanel from '../components/RoomControlPanel';

import AudioService from '../services/AudioService';

class Broadcast extends React.Component {
  componentWillMount() {
    const { user } = FromServer;
    this.props.userActions.setUser(user.id, user.name, user.token);
  }

  render() {
    const { user } = FromServer;

    const analyser = AudioService.getAnalyser();
    const spectrums = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(spectrums);

    const half = Math.floor(spectrums.length / 2);
    const last = spectrums.length - 1;

    const red = Math.floor(spectrums[0] / 2);
    const green = Math.floor(spectrums[half] / 2);
    const blue = Math.floor(spectrums[last] / 2);
    const backgroundColor = `rgb(${red}, ${green}, ${blue})`;

    return (
      <div style={{ backgroundColor }}>
        <Header path="broadcast" user={user} />
        <RoomControlPanel {...this.props} />
      </div>
    );
  }
}

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
