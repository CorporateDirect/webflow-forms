const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'webflow-forms': './src/webflow-forms-fixed-production.js',
    'webflow-forms-complete': './src/webflow-forms-complete-production.js',
    'tryformly-compatible': './src/tryformly-compatible-production.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    library: 'WebflowForms',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.25%, not dead',
                modules: false
              }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false
  },
  resolve: {
    extensions: ['.js']
  },
  performance: {
    maxAssetSize: 50000, // 50KB limit
    maxEntrypointSize: 50000,
    hints: 'warning'
  }
}; 