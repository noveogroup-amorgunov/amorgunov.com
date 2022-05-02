const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssCustomMedia = require('postcss-custom-media');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssPresetEnv = require('postcss-preset-env');
const postcssReporter = require('postcss-reporter');

const IS_DEV = process.env.NODE_ENV !== 'production';
const $js = path.join(__dirname, '../src/assets/javascript/');
const $template = path.join(__dirname, '../src/_includes/layouts/');

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        postcssImport(),
        postcssCustomMedia(),
        postcssNested(),
        postcssPresetEnv(),
        postcssReporter(),
      ],
    },
  },
};

module.exports = {
  entry: {
    main: path.join($js, 'main.entry.ts'),
    post: path.join($js, 'post.entry.ts'),
  },
  output: {
    path: path.join(__dirname, '../src/assets/build'),
    filename: '[name].entry.js?v=[contenthash]',
    publicPath: '/assets/build/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            // Files has just copied by 11ty
            options: { url: false, sourceMap: true },
          },
          postcssLoader
        ].filter(Boolean),
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'main.njk'),
      template: path.join($template, 'main.template.njk'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['post'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'post.njk'),
      template: path.join($template, 'post.template.njk'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css?v=[contenthash]',
    }),
  ],
  devtool: IS_DEV ? 'cheap-module-source-map' : 'source-map',
  optimization: {
    minimizer: IS_DEV ? [] : [new TerserJSPlugin(), new CssMinimizerPlugin()],
    minimize: !IS_DEV,
    splitChunks: {
      chunks: 'all',
    },
  },
};
