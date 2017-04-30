const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './demo/main',
  resolve: {
    extensions: ['.js', '.html']
  },
  module: {
    rules: [
      {
        test: /\.(html|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'svelte-loader'
      }
    ]
  },
  plugins: [ new HtmlWebpackPlugin() ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  devServer: {
    port: 9090
  }
};
