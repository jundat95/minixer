import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Row,
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Checkbox,
  Button,
} from 'react-bootstrap';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import Util from '../Util';
import AudioService from '../services/AudioService';
import SocketService from '../services/SocketService';

import FontAwesome from '../components/FontAwesome';

export default class RoomControlPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      sourceList: {},
      isCapture: false,
      deviceId: '',
      bitRate: 192,
      outputGain: 1.0,
      inputGain: 100,
      isMute: false,
    };
  }

  componentWillMount() {
    this.props.roomSocketActions.connect();

    AudioService.getSourceList(sourceList => this.setState({ sourceList }));
    SocketService.on('room_broadcast', data => this.handleRoomBroadcast(data));
    SocketService.on('room_end', () => this.props.roomSocketActions.disconnect());
    SocketService.on('room_terminate', () => this.props.roomSocketActions.disconnect());
  }

  handleRoomBroadcast(data) {
    const { payload } = data;
    if (payload.type !== 'audio_buffer') {
      return;
    }

    const { blob, duration } = payload;
    AudioService.decodeAndPlay(blob, duration, 0);
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
      AudioService.changeOutputGain(this.state.outputGain);
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

  renderInputSourceSelector() {
    const { sourceList } = this.state;

    return (
      <FormGroup>
        <ControlLabel>Input Source</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.deviceId}
          onChange={e => this.handleSourceChange(e)}
          disabled={this.state.isCapture}
        >
          {Object.values(sourceList).map(source => (
            <option key={source.deviceId} value={source.deviceId}>{source.label}</option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  renderBitRateSelector() {
    return (
      <FormGroup>
        <ControlLabel>Bit Rate</ControlLabel>
        <FormControl
          componentClass="select"
          value={this.state.bitRate}
          onChange={e => this.handleBitRateChange(e)}
          disabled={this.state.isCapture}
        >
          <option value={192}>192Kbps</option>
          <option value={240}>240Kbps</option>
          <option value={320}>320Kbps</option>
        </FormControl>
      </FormGroup>
    );
  }

  renderInputGainSlider() {
    return (
      <FormGroup>
        <ControlLabel>Input Gain</ControlLabel>
        <Slider
          min={0}
          max={120}
          step={1}
          value={this.state.inputGain}
          onChange={value => this.handleChangeInputGain(value)}
        />
      </FormGroup>
    );
  }

  renderSoundPanel() {
    const { sourceList } = this.state;
    if (!sourceList || Object.keys(sourceList).length < 1) {
      return null;
    }

    return (
      <Col xs={6}>
        <Panel bsStyle="primary" header="Audio">
          {this.renderInputSourceSelector()}
          {this.renderBitRateSelector()}
          {this.renderInputGainSlider()}
          <Checkbox checked={this.state.isMute} onChange={e => this.handleMuteChange(e)}>
            <FontAwesome iconName="volume-off" />Playback Mute
          </Checkbox>
          {this.state.isCapture ? (
            <Button bsStyle="danger" onClick={() => this.handleStopCapture()} block>
              <FontAwesome iconName="microphone-slash" />Stop Capture
            </Button>
          ) : (
            <Button bsStyle="primary" onClick={() => this.handleStartCapture()} block>
              <FontAwesome iconName="microphone" />Start Capture
            </Button>
          )}
        </Panel>
      </Col>
    );
  }

  renderEndAt() {
    const { endTime } = this.props.roomSocket;
    return Util.getFormattedDate(endTime);
  }

  renderConnectionPanel() {
    const { roomSocket } = this.props;
    return (
      <Col xs={6}>
        <Panel bsStyle="info" header="Room">
          <h5>Room Master</h5>
          <p>{roomSocket.name}</p>
          <h5>State</h5>
          <p>{roomSocket.isRoomOpen ? 'Open' : 'Close'}</p>
          <h5>End At</h5>
          <p>{this.renderEndAt()}</p>
        </Panel>
      </Col>
    );
  }

  render() {
    return (
      <Grid>
        <Row>
          {this.renderConnectionPanel()}
          {this.renderSoundPanel()}
        </Row>
      </Grid>
    );
  }
}

RoomControlPanel.propTypes = {
  user: PropTypes.object.isRequired,
  roomSocket: PropTypes.object.isRequired,
  roomSocketActions: PropTypes.object.isRequired,
};
