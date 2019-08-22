const webpack = require('webpack');
const path = require('path');

// 不显示 DeprecationWarning
process.noDeprecation = true;

module.exports = {
  node: {
    fs: 'empty'
  },
  devtool: 'eval',
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    port: 8000,
    disableHostCheck: true,
  },
  entry: {
    bundle: [
      'webpack-dev-server/client?http://127.0.0.1:8000',
      'webpack/hot/only-dev-server',
      `${__dirname}/index.jsx`,
    ],
  },
  output: {
    path: __dirname,
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[chunkhash:5].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', 'css', 'scss', 'less'],
    modules: [
      path.join(__dirname, 'jsx'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader?modules&localIdentName=[local][hash:base64:5]', 'less-loader'],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        CLIENT: JSON.stringify(true),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
