const path = require('path');

module.exports = {
  entry: {
    'webflow-forms': './src/webflow-forms-fixed.js', // Use the optimized version
    'webflow-forms-complete': './src/webflow-forms-complete.js',
    'tryformly-compatible': './src/tryformly-compatible.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    library: 'WebflowForms',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true // Clean dist folder on each build
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
                modules: false // Enable tree shaking
              }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    usedExports: true, // Enable tree shaking
    sideEffects: false, // Mark as side-effect free
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  externals: {
    // Don't bundle these, expect them to be provided externally
    'libphonenumber-js': 'libphonenumber-js'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  performance: {
    maxAssetSize: 100000, // 100KB warning threshold
    maxEntrypointSize: 100000,
    hints: 'warning'
  }
}; 