const path = require('path');
const webpack = require('webpack');
const postcssCustomMedia = require('postcss-custom-media');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssPresetEnv = require('postcss-preset-env');
const postcssReporter = require('postcss-reporter');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssCssnext = require('postcss-cssnext');

const IS_DEV = process.env.NODE_ENV !== 'production';

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [
      postcssImport(),
      postcssCustomMedia(),
      postcssNested(),
      postcssPresetEnv(),
      postcssReporter(),
      postcssCssnext()
    ]
  }
};

module.exports = {
  entry: path.join(__dirname, '../src/_includes/javascript/app.js'),
  output: {
    path: path.join(__dirname, '../src/assets'),
    filename: 'app.js',

    // Don't create hot-update files
    // @see https://github.com/gaearon/react-hot-loader/issues/456#issuecomment-316522465
    // hotUpdateChunkFilename: '_hot/hot-update.js',
    // hotUpdateMainFilename: '_hot/hot-update.json'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          IS_DEV && 'css-hot-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          postcssLoader
        ].filter(Boolean)
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'app.css'
    })
  ],
  optimization: {
    minimize: !IS_DEV
  }
};
