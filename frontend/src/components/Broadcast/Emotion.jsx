import React from 'react';
import PropTypes from 'prop-types';
import {
  Panel,
  Table,
  Image,
  Button,
} from 'react-bootstrap';

import EmotionMaster from '../../EmotionMaster';
import FontAwesome from '../FontAwesome';

import SocketService from '../../services/SocketService';

const EMOTION_INTERVAL_MSEC = 5 * 1000;

export default class Emotion extends React.Component {
  constructor() {
    super();

    this.state = {
      isAbleToEmotion: true,
    };
  }

  renderEmotionCount(id) {
    const { isRoomMaster, emotionCountById } = this.props.roomSocket;
    const count = emotionCountById[id] || 0;

    if (isRoomMaster) {
      return (
        <td key={id} style={{ textAlign: 'center' }}>
          {count}
        </td>
      );
    }

    const handleClick = (e) => {
      e.preventDefault();

      const { isAbleToEmotion } = this.state;
      if (!isAbleToEmotion) {
        return;
      }

      SocketService.emit('room_emotion', { id }, (result) => {
        if (!result.result) {
          alert('failed to send emotion');
        } else {
          this.setState(
            { isAbleToEmotion: false },
            () => setTimeout(() => this.setState({ isAbleToEmotion: true }), EMOTION_INTERVAL_MSEC)
          );
        }
      });
    };

    return (
      <td key={id} style={{ textAlign: 'center' }}>
        <Button bsStyle="primary" onClick={e => handleClick(e)} disabled={!this.state.isAbleToEmotion}>
          {count}
        </Button>
      </td>
    );
  }

  renderEmotionIcon(id) {
    const master = EmotionMaster[id];
    const style = {
      width: 100,
      margin: '0 auto',
    };

    return (
      <th key={id} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        <Image src={master.src} alt={master.name} style={style} responsive />
      </th>
    );
  }

  render() {
    const { roomSocket } = this.props;
    if (!roomSocket.isRoomOpen) {
      return null;
    }

    const header = <span><FontAwesome iconName="heart" />Emotion</span>;
    return (
      <Panel bsStyle="success" header={header} eventKey="emotion" collapsible defaultExpanded>
        <div className="center-block">
          <Table>
            <tbody>
              <tr>
                {Object.keys(EmotionMaster).map(id => this.renderEmotionIcon(id))}
              </tr>
              <tr>
                {Object.keys(EmotionMaster).map(id => this.renderEmotionCount(id))}
              </tr>
            </tbody>
          </Table>
        </div>
      </Panel>
    );
  }
}

Emotion.propTypes = {
  roomSocket: PropTypes.object.isRequired,
};
