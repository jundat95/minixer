import LameJS from 'lamejs';

const BLOCK_SIZE = 1152;

function convertBuffer(arrayBuffer) {
  const input = new Float32Array(arrayBuffer);
  const output = new Int16Array(arrayBuffer.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
  return output;
}

function encodeMp3(left16bit, right16bit, sampleRate, bitRate) {
  const mp3Encoder = new LameJS.Mp3Encoder(2, sampleRate, bitRate);
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

// eslint-disable-next-line
onmessage = (event) => {
  const { left, right, sampleRate, bitRate } = event.data;
  const left16bit = convertBuffer(left);
  const right16bit = convertBuffer(right);
  const blocks = encodeMp3(left16bit, right16bit, sampleRate, bitRate);

  postMessage(blocks);
};
