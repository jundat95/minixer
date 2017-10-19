import path from 'path';
import Webpack from 'webpack';

const dist = path.resolve(__dirname, '../../backend/public/js');

export default {
  output: {
    path: dist,
    filename: '[name].bundle.min.js',
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new Webpack.optimize.UglifyJsPlugin(),
  ],
};
