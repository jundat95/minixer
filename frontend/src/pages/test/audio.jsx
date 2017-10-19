import React from 'react';
import ReactDom from 'react-dom';

const BUFFER_SIZE = 8192;

const context = new AudioContext();
let startTime = 0;
const bufferList = [];

class Index extends React.Component {
  constructor() {
    super();

    this.state = {
      inputSource: '',
      sourceList: {},
      isCapture: false,
      isPlayback: true,
      localStream: null,
      startTime: 0,
      inputStreamSource: null,
      scriptProcessor: null,
      socket: null,
    };
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

    setInterval(() => {
      const bufferLength = bufferList.length;
      if (bufferLength < 2) {
        return;
      }

      for (let i = 0; i < bufferLength; i++) {
        const buffer = bufferList.shift();

        if (!this.state.isPlayback) {
          return;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);

        const { currentTime } = context;
        source.start(startTime);

        let newStartTime = currentTime + buffer.duration;
        if (currentTime < startTime) {
          newStartTime = startTime + buffer.duration;
        }
        startTime = newStartTime;
      }
    }, 200);
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
        bufferList.splice(0, bufferList.length);
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
        bufferList.push(node.inputBuffer);
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

ReactDom.render(<Index />, document.getElementById('react-content'));
