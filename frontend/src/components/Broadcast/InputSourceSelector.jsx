import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const InputSourceSelector = props => (
  <FormGroup>
    <ControlLabel>Input Source</ControlLabel>
    <FormControl
      componentClass="select"
      value={props.deviceId}
      onChange={e => props.handleSourceChange(e)}
      disabled={props.isCapture}
    >
      {Object.values(props.sourceList).map(source => (
        <option key={source.deviceId} value={source.deviceId}>{source.label}</option>
      ))}
    </FormControl>
  </FormGroup>
);

InputSourceSelector.propTypes = {
  sourceList: PropTypes.object.isRequired,
  deviceId: PropTypes.string.isRequired,
  isCapture: PropTypes.bool.isRequired,
  handleSourceChange: PropTypes.func.isRequired,
};

export default InputSourceSelector;
