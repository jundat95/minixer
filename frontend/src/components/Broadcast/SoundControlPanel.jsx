import React from 'react';
import PropTypes from 'prop-types';
import {
  Panel,
  Checkbox,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import AudioService from '../../services/AudioService';

import InputSourceSelector from './InputSourceSelector';
import BitRateSelector from './BitRateSelector';
import GainSlider from './GainSlider';
import FontAwesome from '../../components/FontAwesome';

const { localStorage } = window;
const DEVICE_ID_KEY = 'default_device_id';
const VISUALIZER_KEY = 'default_visualizer_color';

export default class SoundControlPanel extends React.Component {
  componentWillMount() {
    const { roomControlActions } = this.props;

    if (localStorage !== undefined) {
      const deviceId = localStorage.getItem(DEVICE_ID_KEY);
      if (deviceId !== null) {
        roomControlActions.setState('deviceId', deviceId);
      }

      const visualizerColor = localStorage.getItem(VISUALIZER_KEY);
      if (visualizerColor !== null) {
        roomControlActions.setState('visualizerColor', visualizerColor);
      }
    }
  }

  handleMuteChange(e) {
    const { checked } = e.target;
    if (checked) {
      AudioService.changeOutputGain(0);
    } else {
      AudioService.changeOutputGain(this.props.roomControl.outputGain / 100);
    }
    this.props.roomControlActions.setState('isMute', checked);
  }

  handleSourceChange(e) {
    const { value } = e.target;
    if (localStorage !== undefined) {
      localStorage.setItem(DEVICE_ID_KEY, value);
    }
    this.props.roomControlActions.setState('deviceId', value);
  }

  handleBitRateChange(e) {
    const { value } = e.target;
    this.props.roomControlActions.setState('bitRate', value);
  }

  handleStartCapture() {
    const { roomSocketActions, roomControl, roomControlActions } = this.props;
    AudioService.startCapture(
      roomControl.deviceId,
      roomControl.bitRate,
      (blob, duration) => {
        const payload = { type: 'audio_buffer', blob, duration };
        roomSocketActions.emit('room_broadcast', payload);
      }
    );

    roomControlActions.setState('isCapture', true);
  }

  handleStopCapture() {
    this.props.roomControlActions.setState('isCapture', false);
    AudioService.stopCapture();
  }

  handleChangeInputGain(inputGain) {
    this.props.roomControlActions.setState('inputGain', inputGain);
    AudioService.changeInputGain(inputGain / 100);
  }

  handleChangeOutputGain(outputGain) {
    this.props.roomControlActions.setState('outputGain', outputGain);
    AudioService.changeOutputGain(outputGain / 100);
  }

  renderCaptureButton() {
    const { isRoomMaster } = this.props.roomSocket;
    if (!isRoomMaster) {
      return null;
    }

    if (this.props.roomControl.isCapture) {
      return (
        <Button bsStyle="danger" onClick={() => this.handleStopCapture()} block>
          <FontAwesome iconName="microphone-slash" />Stop Capture
        </Button>
      );
    }

    return (
      <Button bsStyle="primary" onClick={() => this.handleStartCapture()} block>
        <FontAwesome iconName="microphone" />Start Capture
      </Button>
    );
  }

  renderInputForms() {
    const { isRoomMaster } = this.props.roomSocket;
    if (!isRoomMaster) {
      return null;
    }

    const { roomControl } = this.props;
    const inputSelectorProps = {
      sourceList: roomControl.sourceList,
      deviceId: roomControl.deviceId,
      handleSourceChange: e => this.handleSourceChange(e),
      isCapture: roomControl.isCapture,
    };
    const bitRateSelectorProps = {
      bitRate: roomControl.bitRate,
      isCapture: roomControl.isCapture,
      handleBitRateChange: e => this.handleBitRateChange(e),
    };
    const inputGainSliderProps = {
      title: 'Input Gain',
      gain: this.props.roomControl.inputGain,
      sliderColor: 'red',
      handleChangeGain: value => this.handleChangeInputGain(value),
    };

    return (
      <div>
        <InputSourceSelector {...inputSelectorProps} />
        <BitRateSelector {...bitRateSelectorProps} />
        <GainSlider {...inputGainSliderProps} />
      </div>
    );
  }

  renderOutputGainSlider() {
    const sliderProps = {
      title: 'Output Gain',
      gain: this.props.roomControl.outputGain,
      sliderColor: 'blue',
      handleChangeGain: value => this.handleChangeOutputGain(value),
    };

    return <GainSlider {...sliderProps} />;
  }

  renderMuteCheckbox() {
    const checkboxProps = {
      checked: this.props.roomControl.isMute,
      onChange: e => this.handleMuteChange(e),
    };

    return (
      <Checkbox {...checkboxProps}>
        <FontAwesome iconName="volume-off" />Playback Mute
      </Checkbox>
    );
  }

  renderVisualizerOption() {
    const { roomControl, roomControlActions } = this.props;

    const handleChange = (e) => {
      const { value } = e.target;
      roomControlActions.setState('visualizerColor', value);
      if (localStorage !== undefined) {
        localStorage.setItem(VISUALIZER_KEY, value);
      }
    };

    return (
      <FormGroup>
        <ControlLabel>Visualizer Color</ControlLabel>
        <FormControl
          componentClass="select"
          value={roomControl.visualizerColor}
          onChange={e => handleChange(e)}
        >
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="gray">Gray</option>
        </FormControl>
      </FormGroup>
    );
  }

  render() {
    const { isRoomOpen } = this.props.roomSocket;
    if (!isRoomOpen) {
      return null;
    }

    const header = <span><FontAwesome iconName="volume-up" />Audio</span>;
    return (
      <Panel bsStyle="primary" header={header} eventKey="Audio" collapsible defaultExpanded>
        {this.renderInputForms()}
        {this.renderOutputGainSlider()}
        {this.renderVisualizerOption()}
        {this.renderMuteCheckbox()}
        {this.renderCaptureButton()}
      </Panel>
    );
  }
}

SoundControlPanel.propTypes = {
  roomSocket: PropTypes.object.isRequired,
  roomSocketActions: PropTypes.object.isRequired,
  roomControl: PropTypes.object.isRequired,
  roomControlActions: PropTypes.object.isRequired,
};
