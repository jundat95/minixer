import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CanvasComponent extends Component {
  componentDidMount() {
    this.updateCanvas();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.updateCanvas();
    }
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas(e) {
    const { canvas } = this.refs;
    const context = canvas.getContext('2d');
    this.props.updateCanvas(context);
  }

  render() {
    return <canvas ref="canvas" width={this.props.width} height={this.props.height} />;
  }
}

CanvasComponent.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  updateCanvas: PropTypes.func.isRequired,
};
