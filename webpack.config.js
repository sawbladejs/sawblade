module.exports = {
  entry: './src/index',
  resolve: {
    extensions: ['.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  output: {
    path: __dirname,
    filename: 'index.js',
    libraryTarget: 'umd'
  }
};
