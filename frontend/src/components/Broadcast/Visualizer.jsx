import React from 'react';
import PropTypes from 'prop-types';

import AudioService from '../../services/AudioService';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

export default class Visualizer extends React.Component {
  componentDidMount() {
    const { canvas } = this;
    if (canvas === undefined) {
      return;
    }

    const analyser = AudioService.getAnalyser();
    const context = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const draw = () => {
      window.requestAnimationFrame(draw);

      const bufferLength = analyser.frequencyBinCount;
      const spectrums = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(spectrums);
      context.fillStyle = 'rgb(6, 6, 6)';

      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const barWidth = (CANVAS_WIDTH / bufferLength) * 1.5;

      let x = 0;
      const { visualizerColor } = this.props.roomControl;
      for (let i = 0; i < bufferLength; i++) {
        const decibel = spectrums[i];
        const rgb = [50, 50, 50];
        if (visualizerColor === 'red') {
          rgb[0] = decibel + 100;
        } else if (visualizerColor === 'green') {
          rgb[1] = decibel + 100;
        } else if (visualizerColor === 'blue') {
          rgb[2] = decibel + 100;
        } else {
          const color = Math.max(decibel, 50);
          rgb[0] = color;
          rgb[1] = color;
          rgb[2] = color;
        }
        context.fillStyle = `rgb(${rgb.join(', ')})`;

        const h = Math.floor((decibel / 255) * CANVAS_HEIGHT);
        const y = CANVAS_HEIGHT - h;

        context.fillRect(x, y, barWidth, h);
        x += barWidth + 0.2;
      }
    };

    draw();
  }

  render() {
    const style = {
      position: 'fixed',
      top: 128,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: -999,
    };

    return (
      <canvas ref={(e) => { this.canvas = e; }} style={style} />
    );
  }
}

Visualizer.propTypes = {
  roomControl: PropTypes.object.isRequired,
};
