import 'babel-core/register';
import path from 'path';

import production from './production';
import development from './development';

const env = process.env.NODE_ENV;
const src = path.resolve(__dirname, '../src');

let settings = {
  entry: {
    'pages/audio_test': ['babel-polyfill', `${src}/pages/test/audio.jsx`],
    'pages/broadcast_test': ['babel-polyfill', `${src}/pages/test/broadcast.jsx`],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

if (env === 'production') {
  settings = Object.assign(settings, production);
} else {
  settings = Object.assign(settings, development);
}

module.exports = settings;
