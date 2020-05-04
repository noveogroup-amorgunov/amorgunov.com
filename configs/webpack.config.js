const path = require('path');
// const webpack = require('webpack');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const postcssCustomMedia = require('postcss-custom-media');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssPresetEnv = require('postcss-preset-env');
const postcssReporter = require('postcss-reporter');
const postcssCssnext = require('postcss-cssnext');

const IS_DEV = process.env.NODE_ENV !== 'production';
const $js = path.join(__dirname, '../src/_includes/javascript/');
const $template = path.join(__dirname, '../src/_includes/layouts/');

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
  entry: {
    main: path.join($js, 'main.entry.js'),
    post: path.join($js, 'post.entry.js')
  },
  output: {
    path: path.join(__dirname, '../src/assets/build'),
    filename: '[name].entry.js?v=[contenthash]',
    publicPath: '/assets/build/'
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          postcssLoader
        ].filter(Boolean)
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'main.njk'),
      template: path.join($template, 'main.template.njk')
    }),
    new HtmlWebpackPlugin({
      chunks: ['post'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'post.njk'),
      template: path.join($template, 'post.template.njk')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css?v=[contenthash]'
    })
  ],
  // devtool: 'eval-source-map',
  optimization: {
    minimizer: IS_DEV ? [] : [new TerserJSPlugin(), new OptimizeCSSAssetsPlugin()],
    minimize: !IS_DEV,
    splitChunks: {
      chunks: 'all'
    }
  }
};
