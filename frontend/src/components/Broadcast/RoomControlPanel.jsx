import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Grid,
  Row,
  Col,
  PanelGroup,
  Panel,
} from 'react-bootstrap';

import AudioService from '../../services/AudioService';
import SocketService from '../../services/SocketService';
import FromServer from '../../FromServer';

import FontAwesome from '../FontAwesome';
import RoomInfoPanel from './RoomInfoPanel';
import SoundControlPanel from './SoundControlPanel';

export default class RoomControlPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      secondsElapsed: 0,
      showSoundPanel: true,
      showRoomPanel: true,
      roomClosed: false,
    };
  }

  componentWillMount() {
    this.props.roomSocketActions.setReceiveEvent();

    SocketService.on('connected_minixer', data => this.handleConnected(data));
    SocketService.on('room_join', () => {
      this.interval = setInterval(() => this.setState({ secondsElapsed: this.state.secondsElapsed + 1 }), 1000);
    });
    SocketService.on('room_broadcast', data => this.handleRoomBroadcast(data));
    SocketService.on('room_end', () => this.handleRoomEnd());
    SocketService.on('room_terminate', () => this.handleRoomEnd());
  }

  componentWillReceiveProps(nextProps) {
    const { roomSocket } = this.props;
    const nextRoomSocket = nextProps.roomSocket;
    if (!roomSocket.isRoomMaster && nextRoomSocket.isRoomMaster) {
      AudioService.getSourceList(sourceList => this.props.roomControlActions.setState('sourceList', sourceList));
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleConnected(data) {
    const newData = _.cloneDeep(data);

    if (FromServer.room_id === data.userId) {
      SocketService.emit('room_create', {}, (result) => {
        if (!result.result) {
          alert('ルーム作成に失敗しました');
        }
      });
    } else {
      newData.roomId = FromServer.room_id;
      const emitData = { roomId: FromServer.room_id };

      SocketService.emit('room_join', emitData, (result) => {
        if (!result.result && result.message === 'ROOM_NOT_FOUND') {
          this.setState({ roomClosed: true });
        } else {
          alert('ルームへの入室に失敗しました');
        }
      });
    }

    this.props.userActions.setUser(newData);
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

    this.setState({ roomClosed: true });
    clearInterval(this.interval);
  }

  handleExtendRoom() {
    SocketService.emit('room_extend', { count: 1 }, (response) => {
      if (!response.result) {
        alert('延長処理に失敗しました');
      }
    });
  }

  renderClosedPanel() {
    if (!this.state.roomClosed) {
      return null;
    }

    return (
      <Col xs={12}>
        <Panel bsStyle="warning" header={(<span><FontAwesome iconName="warning" />Room is already closed</span>)}>
          This room is closed...
        </Panel>
      </Col>
    );
  }

  render() {
    return (
      <Grid>
        <PanelGroup>
          <Row>
            {this.renderClosedPanel()}
          </Row>
          <Row>
            <Col xs={12} sm={6}>
              <RoomInfoPanel {...this.props} />
            </Col>
            <Col xs={12} sm={6}>
              <SoundControlPanel {...this.props} />
            </Col>
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
  roomControl: PropTypes.object.isRequired,
  roomControlActions: PropTypes.object.isRequired,
};
