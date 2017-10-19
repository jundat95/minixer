import React from 'react';
import ReactDom from 'react-dom';
import SocketIO from 'socket.io-client';

const BUFFER_SIZE = 8192;

const AudioContext = window.AudioContext
  || window.webkitAudioContext
  || false;

const context = new AudioContext();
let startTime = 0;

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
    };
  }

  componentWillMount() {
    const socket = SocketIO.connect(
      'https://192.168.101.21:9999',
      {
        query: 'id=1',
      }
    );

    socket.on('audio_buffer', (buffers) => {
      const buffer0 = new Float32Array(buffers[0]);
      const buffer1 = new Float32Array(buffers[1]);
      const source = context.createBufferSource();
      const audioBuffer = context.createBuffer(2, BUFFER_SIZE, context.sampleRate);
      audioBuffer.getChannelData(0).set(buffer0);
      audioBuffer.getChannelData(1).set(buffer1);
      source.buffer = audioBuffer;
      source.connect(context.destination);

      const { currentTime } = context;
      source.start(startTime);

      let newStartTime = currentTime + audioBuffer.duration;
      if (currentTime < startTime) {
        newStartTime = startTime + audioBuffer.duration;
      }
      startTime = newStartTime;
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

      this.setState({
        localStream: stream,
        inputStreamSource,
        scriptProcessor,
      });

      inputStreamSource.connect(scriptProcessor);
      scriptProcessor.connect(context.destination);

      scriptProcessor.onaudioprocess = (node) => {
        const { inputBuffer } = node;
        const data1 = inputBuffer.getChannelData(0);
        const data2 = inputBuffer.getChannelData(1);
        this.state.socket.emit('audio_buffer', [data1.buffer, data2.buffer]);
      };
    });
  }

  handlePlayback(e) {
    const { checked } = e.target;
    this.setState({ isPlayback: checked });
  }

  render() {
    return (
      <div>
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
    );
  }
}

ReactDom.render(<Broadcast />, document.getElementById('react-content'));
