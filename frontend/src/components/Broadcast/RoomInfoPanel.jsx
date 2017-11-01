import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Button } from 'react-bootstrap';

import Util from '../../Util';
import SocketService from '../../services/SocketService';

import FontAwesome from '../../components/FontAwesome';

export default class RoomInfoPanel extends React.Component {
  getPlayedTime() {
    const { startTime, diffTime } = this.props.roomSocket;
    const time = Util.getTimestamp();
    return (time - startTime) + diffTime;
  }

  getRemainTime() {
    const { endTime, diffTime } = this.props.roomSocket;
    const time = Util.getTimestamp();
    return (endTime - time) + diffTime;
  }

  handleCloseRoom() {
    const { roomSocketActions } = this.props;
    roomSocketActions.emit('room_finish', {}, () => {});
  }

  handleExtendRoom() {
    const { roomSocketActions } = this.props;
    roomSocketActions.emit('room_extend', { count: 1 }, (response) => {
      if (!response.result) {
        alert('延長処理に失敗しました');
      }
    });
  }

  renderEndAt() {
    const { endTime } = this.props.roomSocket;
    return Util.getFormattedDate(endTime);
  }

  renderFormattedTime(time) {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time - (h * 3600)) / 60);
    const s = time - ((h * 3600) + (m * 60));

    return `${h}:${`00${m}`.substr(-2)}:${`00${s}`.substr(-2)}`;
  }

  renderPlayed() {
    const played = this.getPlayedTime();
    return this.renderFormattedTime(played);
  }

  renderRemain() {
    const remain = this.getRemainTime();
    return this.renderFormattedTime(remain);
  }

  renderExtendBtn() {
    const { isRoomOpen, isRoomMaster, extendCount } = this.props.roomSocket;
    if (isRoomOpen && isRoomMaster && extendCount <= 10) {
      return (
        <Button bsStyle="success" onClick={() => this.handleExtendRoom()} block>
          <FontAwesome iconName="clock-o" />Extend 30 mins
        </Button>
      );
    }
    return null;
  }

  renderCloseBtn() {
    const { isRoomOpen, isRoomMaster } = this.props.roomSocket;
    if (isRoomOpen && isRoomMaster) {
      return (
        <Button bsStyle="warning" onClick={() => this.handleCloseRoom()} block>
          <FontAwesome iconName="window-close" />Close
        </Button>
      );
    }

    return null;
  }

  render() {
    const { roomSocket } = this.props;
    if (!roomSocket.isRoomOpen) {
      return null;
    }

    const header = <span><FontAwesome iconName="home" />Room</span>;
    const twitterUrl = `https://twitter.com/${roomSocket.name}`;

    return (
      <Panel bsStyle="info" header={header} eventKey="Room" collapsible defaultExpanded>
        <h6>Room Master</h6>
        <p><a href={twitterUrl} target="_blank">{roomSocket.name}</a></p>
        <h6>State</h6>
        <p>{roomSocket.isRoomOpen ? 'Open' : 'Close'}</p>
        <h6>End At</h6>
        <p>{this.renderEndAt()}</p>
        <h6>Member(Current / Max)</h6>
        {roomSocket.currentUserCount} / {roomSocket.maxUserCount}
        <h6>Played / Remain</h6>
        {roomSocket.isRoomOpen ? this.renderPlayed() : 0} / {roomSocket.isRoomOpen ? this.renderRemain() : 0}
        {this.renderCloseBtn()}
        {this.renderExtendBtn()}
      </Panel>
    );
  }
}

RoomInfoPanel.propTypes = {
  roomSocket: PropTypes.object.isRequired,
  roomSocketActions: PropTypes.object.isRequired,
};
