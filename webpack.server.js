const nodeExternals = require('webpack-node-externals');

const path = require('path');

const config = {
  // If you don't target node here, since node will excute this not browser,
  // Error will be thrown
  target: 'node',

  entry: './src/index',

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules : [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  externals: [nodeExternals()]
};

module.exports = config;
