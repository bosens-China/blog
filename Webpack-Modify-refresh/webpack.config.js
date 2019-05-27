const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'hello wrold',
      filename: 'index.html',
      template: './src/index.ejs'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
        test: /\.ejs$/,
        use: [
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attrs: 'img:src'
            }
          },
          'ejs-loader'
        ]
      },
      {
        test: /\.html$/,
        use: [
          "raw-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ],
  },
  devServer: {
    contentBase: './dist',
    hot: true
  }
};