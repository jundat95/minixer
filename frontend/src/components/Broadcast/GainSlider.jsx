import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-rangeslider';
import { FormGroup, ControlLabel } from 'react-bootstrap';

import 'react-rangeslider/lib/index.css';
import './GainSlider.css';

const GainSlider = props => (
  <FormGroup>
    <ControlLabel>{props.title}</ControlLabel>
    <div className={`range-slider-${props.sliderColor}`}>
      <Slider
        min={0}
        max={150}
        step={1}
        value={props.gain}
        onChange={value => props.handleChangeGain(value)}
      />
    </div>
  </FormGroup>
);

GainSlider.propTypes = {
  title: PropTypes.string.isRequired,
  gain: PropTypes.number.isRequired,
  sliderColor: PropTypes.string.isRequired,
  handleChangeGain: PropTypes.func.isRequired,
};

export default GainSlider;
