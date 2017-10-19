import path from 'path';

const dist = path.resolve(__dirname, '../../backend/public/js');

export default {
  output: {
    path: dist,
    filename: '[name].bundle.js',
  },
  devtool: 'source-map',
};
