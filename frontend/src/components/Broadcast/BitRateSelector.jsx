import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const BitRateSelector = props => (
  <FormGroup>
    <ControlLabel>Bit Rate</ControlLabel>
    <FormControl
      componentClass="select"
      value={props.bitRate}
      onChange={e => props.handleBitRateChange(e)}
      disabled={props.isCapture}
    >
      <option value={192}>192Kbps</option>
      <option value={240}>240Kbps</option>
      <option value={320}>320Kbps</option>
    </FormControl>
  </FormGroup>
);

BitRateSelector.propTypes = {
  bitRate: PropTypes.number.isRequired,
  isCapture: PropTypes.bool.isRequired,
  handleBitRateChange: PropTypes.func.isRequired,
};

export default BitRateSelector;
