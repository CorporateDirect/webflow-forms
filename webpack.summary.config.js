const path = require('path');

module.exports = {
  entry: './src/webflow-forms-summary.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webflow-forms-summary.min.js',
    library: 'WebflowSummaryCards',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true
  }
};
