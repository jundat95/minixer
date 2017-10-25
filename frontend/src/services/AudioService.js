import LameJS from 'lamejs';

const AudioContext = window.AudioContext
  || window.webkitAudioContext
  || false;

const BUFFER_SIZE = 16384;
const BLOCK_SIZE = 1152;

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
    this.analyser.fftSize = 128;

    this.playStartTime = 0;
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

    navigator.mediaDevices.getUserMedia(params).then((stream) => {
      const inputStreamSource = this.context.createMediaStreamSource(stream);
      const scriptProcessor = this.context.createScriptProcessor(BUFFER_SIZE, 2, 2);

      inputStreamSource.connect(this.inputGainNode);
      this.inputGainNode.connect(scriptProcessor);
      scriptProcessor.connect(this.context.destination);

      scriptProcessor.onaudioprocess = (node) => {
        const { inputBuffer } = node;
        const mp3Data = this.encodePCMtoMP3(inputBuffer, bitRate);
        const blob = new Blob(mp3Data, { type: 'audio/mp3' });
        callback(blob, inputBuffer.duration);
      };

      this.localStream = stream;
      this.inputStreamSource = inputStreamSource;
      this.scriptProcessor = scriptProcessor;
      this.isCapture = true;
    });
  }

  encodePCMtoMP3(inputBuffer, bitRate) {
    const mp3Encoder = new LameJS.Mp3Encoder(2, this.context.sampleRate, bitRate);

    const left = inputBuffer.getChannelData(0);
    const left16bit = this.convertBuffer(left);
    const right = inputBuffer.getChannelData(1);
    const right16bit = this.convertBuffer(right);

    const blocks = [];
    let remaining = left16bit.length;
    for (let i = 0; remaining >= 0; i += BLOCK_SIZE) {
      const leftBuf = left16bit.subarray(i, i + BLOCK_SIZE);
      const rightBuf = right16bit.subarray(i, i + BLOCK_SIZE);
      const mp3Buf = mp3Encoder.encodeBuffer(leftBuf, rightBuf);
      if (mp3Buf.length > 0) {
        blocks.push(new Int8Array(mp3Buf));
      }
      remaining -= BLOCK_SIZE;
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

  decodeAndPlay(blob, duration, playDelaySec) {
    this.context.decodeAudioData(blob, (decodedAudio) => {
      const source = this.context.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(this.outputGainNode);
      source.connect(this.analyser);
      this.outputGainNode.connect(this.context.destination);

      const { currentTime } = this.context;
      if (currentTime < this.playStartTime) {
        this.playStartTime += duration;
      } else {
        this.playStartTime = currentTime + duration + playDelaySec;
      }
      source.start(this.playStartTime);
    });
  }

  changeOutputGain(value) {
    this.outputGainNode.gain.value = value;
  }

  changeInputGain(value) {
    this.inputGainNode.gain.value = value;
  }

  getAnalyser() {
    return this.analyser;
  }
}

const instance = new AudioService();
export default instance;
