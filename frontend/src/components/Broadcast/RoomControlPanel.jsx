import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Row,
  Col,
  PanelGroup,
  Panel,
  Button,
} from 'react-bootstrap';

import Util from '../../Util';
import AudioService from '../../services/AudioService';
import SocketService from '../../services/SocketService';
import FromServer from '../../FromServer';

import SoundControlPanel from './SoundControlPanel';

export default class RoomControlPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      sourceList: {},
      isCapture: false,
      deviceId: '',
      bitRate: 192,
      outputGain: 100,
      inputGain: 100,
      isMute: false,
      showSoundPanel: true,
      showRoomPanel: true,
    };
  }

  componentWillMount() {
    this.props.roomSocketActions.setReceiveEvent();

    AudioService.getSourceList(sourceList => this.setState({ sourceList }));
    SocketService.on('connected_minixer', data => this.handleConnected(data));
    SocketService.on('room_broadcast', data => this.handleRoomBroadcast(data));
    SocketService.on('room_end', () => this.handleRoomEnd());
    SocketService.on('room_terminate', () => this.handleRoomEnd());
  }

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

  handleConnected(data) {
    this.props.userActions.setUser(data);

    if (FromServer.room_id === data.id) {
      SocketService.emit('room_create', {}, (result) => {
        if (!result.result) {
          alert('ルーム作成に失敗しました');
        }
      });
    }
  }

  handleRoomBroadcast(data) {
    const { payload } = data;
    if (payload.type !== 'audio_buffer') {
      return;
    }

    const { blob, duration } = payload;
    AudioService.decodeAndPlay(blob, duration, 0);
  }

  handleRoomEnd() {
    this.props.roomSocketActions.disconnect();
    if (this.state.isCapture) {
      AudioService.stopCapture();
    }
  }

  handleSourceChange(e) {
    const { value } = e.target;
    this.setState({ deviceId: value });
  }

  handleBitRateChange(e) {
    const { value } = e.target;
    this.setState({ bitRate: value });
  }

  handleMuteChange(e) {
    const { checked } = e.target;
    if (checked) {
      AudioService.changeOutputGain(0);
    } else {
      AudioService.changeOutputGain(this.state.outputGain / 100);
    }

    this.setState({ isMute: checked });
  }

  handleStartCapture() {
    const { roomSocketActions } = this.props;
    AudioService.startCapture(
      this.state.deviceId,
      this.state.bitRate,
      (blob, duration) => {
        const payload = { type: 'audio_buffer', blob, duration };
        roomSocketActions.emit('room_broadcast', payload);
      }
    );

    this.setState({ isCapture: true });
  }

  handleStopCapture() {
    this.setState({ isCapture: false });
    AudioService.stopCapture();
  }

  handleChangeInputGain(inputGain) {
    this.setState({ inputGain });
    AudioService.changeInputGain(inputGain / 100);
  }

  handleChangeOutputGain(outputGain) {
    this.setState({ outputGain });
    AudioService.changeOutputGain(outputGain / 100);
  }

  handleCloseRoom() {
    SocketService.emit('room_finish', {}, () => {});
  }

  handleExtendRoom() {
    SocketService.emit('room_extend', { count: 1 }, (response) => {
      if (!response.result) {
        alert('延長処理に失敗しました');
      }
    });
  }

  renderSoundPanel() {
    const { sourceList } = this.state;
    if (!sourceList || Object.keys(sourceList).length < 1) {
      return null;
    }
    const { isRoomOpen } = this.props.roomSocket;
    if (!isRoomOpen) {
      return null;
    }

    const inputSourceSelectorProps = {
      sourceList: this.state.sourceList,
      deviceId: this.state.deviceId,
      isCapture: this.state.isCapture,
      handleSourceChange: e => this.handleSourceChange(e),
    };
    const bitRateSelectorProps = {
      bitRate: this.state.bitRate,
      isCapture: this.state.isCapture,
      handleBitRateChange: e => this.handleBitRateChange(e),
    };
    const inputGainSliderProps = {
      title: 'Input Gain',
      gain: this.state.inputGain,
      handleChangeGain: e => this.handleChangeInputGain(e),
      sliderColor: 'red',
    };
    const outputGainSliderProps = {
      title: 'Output Gain',
      gain: this.state.outputGain,
      handleChangeGain: e => this.handleChangeOutputGain(e),
      sliderColor: 'blue',
    };

    const controlPanelProps = {
      roomSocket: this.props.roomSocket,
      inputSourceSelectorProps,
      bitRateSelectorProps,
      inputGainSliderProps,
      outputGainSliderProps,
      muteCheckProps: {
        checked: this.state.isMute,
        onChange: e => this.handleMuteChange(e),
      },
      isCapture: this.state.isCapture,
      handleStopCapture: () => this.handleStopCapture(),
      handleStartCapture: () => this.handleStartCapture(),
    };

    return (
      <Col xs={12} sm={6}>
        <SoundControlPanel {...controlPanelProps} />
      </Col>
    );
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

  renderRoomPanel() {
    const { roomSocket } = this.props;
    const twitterUrl = `https://twitter.com/${roomSocket.name}`;

    return (
      <Col xs={12} sm={6}>
        <Panel bsStyle="info" header="Room" eventKey="Room" collapsible defaultExpanded>
          <h6>Room Master</h6>
          <p><a href={twitterUrl} target="_blank">{roomSocket.name}</a></p>
          <h6>State</h6>
          <p>{roomSocket.isRoomOpen ? 'Open' : 'Close'}</p>
          <h6>End At</h6>
          <p>{this.renderEndAt()}</p>
          <h6>Played / Remain</h6>
          {roomSocket.isRoomOpen ? this.renderPlayed() : 0}
          &nbsp;/&nbsp;
          {roomSocket.isRoomOpen ? this.renderRemain() : 0}
          {roomSocket.isRoomOpen && roomSocket.isRoomMaster ? (
            <Button bsStyle="warning" onClick={() => this.handleCloseRoom()} block>Close</Button>
          ) : null}
          {roomSocket.isRoomOpen && roomSocket.isRoomMaster && roomSocket.extendCount <= 10 ? (
            <Button bsStyle="success" onClick={() => this.handleExtendRoom()} block>Extend</Button>
          ) : null}
        </Panel>
      </Col>
    );
  }

  render() {
    return (
      <Grid>
        <PanelGroup>
          <Row>
            {this.renderRoomPanel()}
            {this.renderSoundPanel()}
          </Row>
        </PanelGroup>
      </Grid>
    );
  }
}

RoomControlPanel.propTypes = {
  user: PropTypes.object.isRequired,
  userActions: PropTypes.object.isRequired,
  roomSocket: PropTypes.object.isRequired,
  roomSocketActions: PropTypes.object.isRequired,
};
