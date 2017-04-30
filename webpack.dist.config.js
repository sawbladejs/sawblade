module.exports = {
  entry: './src/index',
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
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
  },
  externals: ['rxjs/Rx']
};
