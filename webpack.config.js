const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  // devtool: "eval",
  entry: "./src/index.jsx",
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: "index.js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".less"],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader?context=/&modules&localIdentName=toast-[local]-[hash:base64:5]', 'less-loader'],
      },
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: false,
      parallel: 4,
      uglifyOptions: {
        minimize: true,
        unused: true,
        ecma: 5,
        ie8: false,
        warnings: false,
        compress: {
          warnings: false,
          drop_console: true,
        },
      },
    })
  ]
};