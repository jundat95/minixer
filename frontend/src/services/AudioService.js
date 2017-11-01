import FromServer from '../FromServer';

const isDebug = FromServer.is_debug;

const AudioContext = window.AudioContext
  || window.webkitAudioContext
  || false;

const BUFFER_SIZE = 16384;

class AudioService {
  constructor() {
    this.context = new AudioContext();
    this.isCapture = false;
    this.localStream = null;
    this.inputStreamSource = null;
    this.scriptProcessor = null;

    this.inputGainNode = this.context.createGain();
    this.outputGainNode = this.context.createGain();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;

    this.playStartTime = 0;
    if (isDebug) {
      this.worker = new Worker('/js/workers/encoding.bundle.js');
    } else {
      this.worker = new Worker('/js/workers/encoding.bundle.min.js');
    }
  }

  getSourceList(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const sourceList = {};
        devices.filter((device) => {
          return device.kind === 'audioinput';
        }).forEach((device) => {
          sourceList[device.deviceId] = device;
        });
        callback(sourceList);
      });
    });
  }

  startCapture(deviceId, bitRate, callback) {
    const params = {
      audio: {
        deviceId,
        echoCancellation: false,
      },
      video: false,
    };
    const sampleRate = this.context.sampleRate;

    navigator.mediaDevices.getUserMedia(params).then((stream) => {
      const inputStreamSource = this.context.createMediaStreamSource(stream);
      const scriptProcessor = this.context.createScriptProcessor(BUFFER_SIZE, 2, 2);

      inputStreamSource.connect(this.inputGainNode);
      this.inputGainNode.connect(scriptProcessor);
      scriptProcessor.connect(this.context.destination);

      scriptProcessor.onaudioprocess = (node) => {
        const { inputBuffer } = node;
        const left = inputBuffer.getChannelData(0);
        const right = inputBuffer.getChannelData(1);

        this.worker.onmessage = (event) => {
          const mp3Data = event.data;
          const blob = new Blob(mp3Data, { type: 'audio/mp3' });
          callback(blob, inputBuffer.duration);
        };
        this.worker.postMessage({ left, right, sampleRate, bitRate });
      };

      this.localStream = stream;
      this.inputStreamSource = inputStreamSource;
      this.scriptProcessor = scriptProcessor;
      this.isCapture = true;
    });
  }

  stopCapture() {
    if (!this.isCapture || this.localStream === null) {
      return;
    }

    this.localStream.getAudioTracks().forEach(track => track.stop());
    this.inputStreamSource.disconnect(this.inputGainNode);
    this.inputGainNode.disconnect(this.scriptProcessor);
    this.scriptProcessor.disconnect(this.context.destination);
    this.localStream = null;
  }

  decodeAndPlay(blob, duration) {
    this.context.decodeAudioData(blob, (decodedAudio) => {
      const source = this.context.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(this.outputGainNode);
      source.connect(this.analyser);
      this.outputGainNode.connect(this.context.destination);

      const { currentTime } = this.context;
      const playStartTime = this.playStartTime;
      if (currentTime < playStartTime) {
        this.playStartTime += duration;
      } else {
        this.playStartTime = currentTime + duration;
      }

      source.start(this.playStartTime);
    });
  }

  changeOutputGain(value) {
    this.outputGainNode.gain.setTargetAtTime(value, this.context.currentTime, 0.015);
  }

  changeInputGain(value) {
    this.inputGainNode.gain.setTargetAtTime(value, this.context.currentTime, 0.015);
  }

  getAnalyser() {
    return this.analyser;
  }

  // 最初の start は必ずタップが必要なので空の buffer を start させる
  emptyBufferPlayForIOS() {
    this.context.createBufferSource().start(0);
  }
}

const instance = new AudioService();
export default instance;
