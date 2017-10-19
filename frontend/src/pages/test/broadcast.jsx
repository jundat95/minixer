import React from 'react';
import ReactDom from 'react-dom';
import SocketIO from 'socket.io-client';
import LameJS from 'lamejs';

import Util from '../../Util';

const BUFFER_SIZE = 16384;

const AudioContext = window.AudioContext
  || window.webkitAudioContext
  || false;

const context = new AudioContext();
let playStartTime = 0;

class Broadcast extends React.Component {
  constructor() {
    super();

    this.state = {
      inputSource: '',
      sourceList: {},
      isCapture: false,
      isPlayback: true,
      localStream: null,
      inputStreamSource: null,
      scriptProcessor: null,
      socket: null,
      playDelaySec: 0,
      roomId: 'room_1',
      joinedRoomId: null,
      isMaster: false,
    };
  }

  componentWillMount() {
    const socket = SocketIO.connect(
      'https://192.168.101.21:9999',
      {
        query: `id=${Util.getRandom(9999999)}`,
      }
    );

    socket.on('audio_buffer', (data) => {
      if (this.state.isMaster && !this.state.isPlayback) {
        return;
      }

      context.decodeAudioData(data.blob, (decodedAudio) => {
        const source = context.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(context.destination);

        const { currentTime } = context;
        if (currentTime < playStartTime) {
          playStartTime += data.duration;
        } else {
          playStartTime = currentTime + data.duration + this.state.playDelaySec;
        }
        source.start(playStartTime);
      });
    });
    this.setState({ socket });
  }

  componentDidMount() {
    const p = navigator.mediaDevices.enumerateDevices();
    p.then((devices) => {
      const sourceList = {};
      devices.filter((device) => {
        return device.kind === 'audioinput';
      }).forEach((device) => {
        sourceList[device.deviceId] = device;
      });
      this.setState({ sourceList });
    });
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      inputSource: value,
    });
  }

  handleCapture(bool) {
    const old = this.state.isCapture;
    if (old === bool) {
      return;
    }

    this.setState({ isCapture: bool });

    if (!bool) {
      if (this.state.localStream !== null) {
        this.state.localStream.getAudioTracks().forEach(track => track.stop());
        this.state.inputStreamSource.disconnect(this.state.scriptProcessor);
        this.state.scriptProcessor.disconnect(context.destination);
        this.setState({ localStream: null });
        return;
      }
    }

    const params = {
      audio: {
        deviceId: this.state.inputSource,
        echoCancellation: false,
      },
      video: false,
    };
    navigator.mediaDevices.getUserMedia(params).then((stream) => {
      const inputStreamSource = context.createMediaStreamSource(stream);
      const scriptProcessor = context.createScriptProcessor(BUFFER_SIZE, 2, 2);

      inputStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(context.destination);

      scriptProcessor.onaudioprocess = (node) => {
        const { inputBuffer } = node;
        const mp3Data = this.encodePCMtoMP3(inputBuffer);
        const blob = new Blob(mp3Data, { type: 'audio/mp3' });
        // エンコーディングした後の長さが変わっちゃうっぽいので録ったときの長さも渡す
        this.state.socket.emit('audio_buffer', { blob, duration: inputBuffer.duration }, () => {});
      };

      this.setState({
        localStream: stream,
        inputStreamSource,
        scriptProcessor,
      });
    });
  }

  encodePCMtoMP3(inputBuffer) {
    const mp3Encoder = new LameJS.Mp3Encoder(2, context.sampleRate, 320);

    const left = inputBuffer.getChannelData(0);
    const left16bit = this.convertBuffer(left);
    const right = inputBuffer.getChannelData(1);
    const right16bit = this.convertBuffer(right);

    const blocks = [];
    let remaining = left16bit.length;
    const maxSample = 1152;
    for (let i = 0; remaining >= 0; i += maxSample) {
      const leftBuf = left16bit.subarray(i, i + maxSample);
      const rightBuf = right16bit.subarray(i, i + maxSample);
      const mp3Buf = mp3Encoder.encodeBuffer(leftBuf, rightBuf);
      if (mp3Buf.length > 0) {
        blocks.push(new Int8Array(mp3Buf));
      }
      remaining -= maxSample;
    }

    blocks.push(new Int8Array(mp3Encoder.flush()));

    return blocks;
  }

  convertBuffer(arrayBuffer) {
    const input = new Float32Array(arrayBuffer);
    const output = new Int16Array(arrayBuffer.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
    }
    return output;
  }

  handlePlayback(e) {
    const { checked } = e.target;
    this.setState({ isPlayback: checked });
  }

  handleCreateRoom() {
    const { socket, roomId } = this.state;
    socket.emit('room_create', { id: roomId, pass: null }, (data) => {
      if (!data.result) {
        return;
      }

      this.setState({ joinedRoomId: roomId, isMaster: true });
      console.log('room_create', data);
    });
  }

  handleJoinRoom() {
    const { socket, roomId } = this.state;
    socket.emit('room_join', { id: roomId, pass: null }, (data) => {
      if (!data.result) {
        return;
      }

      this.setState({ joinedRoomId: roomId, isMaster: false });
      console.log('room_join', data);
    });
  }

  handleLeaveRoom() {
    const { socket } = this.state;
    socket.emit('room_leave', {}, (data) => {
      this.setState({ joinedRoomId: null, isMaster: false });
      console.log('room_leave', data);
    });
  }

  render() {
    const captureZoneStyle = {
      display: this.state.joinedRoomId !== null && this.state.isMaster ? 'block' : 'none',
    };

    return (
      <div>
        <div>
          RoomId: <input value={this.state.roomId} onChange={e => this.setState({ roomId: e.target.value })} /><br />
          {this.state.joinedRoomId === null ? (<button onClick={() => this.handleCreateRoom()}>Create</button>) : null}
          {this.state.joinedRoomId === null ? (<button onClick={() => this.handleJoinRoom()}>Join</button>) : null}
          {this.state.joinedRoomId !== null ? (<button onClick={() => this.handleLeaveRoom()}>Leave</button>) : null}
        </div>

        <div style={captureZoneStyle}>
          <div>
            <select value={this.state.inputSource} onChange={e => this.handleInputChange(e)}>
              {Object.values(this.state.sourceList).map((source) => {
                return <option key={source.deviceId} value={source.deviceId}>{source.label}</option>;
              })}
            </select>
          </div>
          <div>
            {this.state.isCapture ? (
              <button onClick={() => this.handleCapture(false)}>Capture Off</button>
            ) : (
              <button onClick={() => this.handleCapture(true)}>Capture On</button>
            )}
          </div>
          <div>
            <input type="checkbox" checked={this.state.isPlayback} onChange={e => this.handlePlayback(e)} />
            :Playback
          </div>
        </div>
      </div>
    );
  }
}

ReactDom.render(<Broadcast />, document.getElementById('react-content'));
