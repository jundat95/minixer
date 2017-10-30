import React from 'react';
import PropTypes from 'prop-types';
import {
  Panel,
  Checkbox,
  Button,
} from 'react-bootstrap';

import InputSourceSelector from './InputSourceSelector';
import BitRateSelector from './BitRateSelector';
import GainSlider from './GainSlider';
import FontAwesome from '../../components/FontAwesome';

const SoundControlPanel = (props) => {
  const { isRoomMaster } = props.roomSocket;

  return (
    <Panel bsStyle="primary" header="Audio" eventKey="Audio" collapsible defaultExpanded>
      {isRoomMaster ? (
        <div>
          <InputSourceSelector {...props.inputSourceSelectorProps} />
          <BitRateSelector {...props.bitRateSelectorProps} />
          <GainSlider {...props.inputGainSliderProps} />
        </div>
      ) : null}
      <GainSlider {...props.outputGainSliderProps} />
      <Checkbox {...props.muteCheckProps}>
        <FontAwesome iconName="volume-off" />Playback Mute
      </Checkbox>
      {props.isCapture ? (
        <Button bsStyle="danger" onClick={() => props.handleStopCapture()} block>
          <FontAwesome iconName="microphone-slash" />Stop Capture
        </Button>
      ) : (
        <Button bsStyle="primary" onClick={() => props.handleStartCapture()} block>
          <FontAwesome iconName="microphone" />Start Capture
        </Button>
      )}
    </Panel>
  );
};

SoundControlPanel.propTypes = {
  roomSocket: PropTypes.object.isRequired,
  inputSourceSelectorProps: PropTypes.object.isRequired,
  bitRateSelectorProps: PropTypes.object.isRequired,
  inputGainSliderProps: PropTypes.object.isRequired,
  outputGainSliderProps: PropTypes.object.isRequired,
  muteCheckProps: PropTypes.object.isRequired,
  isCapture: PropTypes.bool.isRequired,
  handleStopCapture: PropTypes.func.isRequired,
  handleStartCapture: PropTypes.func.isRequired,
};

export default SoundControlPanel;
