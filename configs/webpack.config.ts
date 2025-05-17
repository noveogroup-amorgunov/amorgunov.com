import path from 'node:path'
import process from 'node:process'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import postcssCustomMedia from 'postcss-custom-media'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'
import postcssPresetEnv from 'postcss-preset-env'
import postcssReporter from 'postcss-reporter'
import TerserJSPlugin from 'terser-webpack-plugin'

const IS_DEV = process.env.NODE_ENV !== 'production'
const $js = path.join(__dirname, '../src/client/javascript/')
const $template = path.join(__dirname, '../src/_includes/layouts/')

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
}

module.exports = {
  entry: {
    post: path.join($js, 'post.entry.ts'),
    next: path.join($js, 'next.entry.ts'),
  },
  output: {
    path: path.join(__dirname, '../src/client/build'),
    filename: '[name].entry.js?v=[contenthash]',
    publicPath: '/client/build/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
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
          postcssLoader,
        ].filter(Boolean),
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['post'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'post.hbs'),
      template: path.join($template, 'post.webpack.hbs'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['next'],
      inject: false,
      minify: !IS_DEV,
      filename: path.join($template, 'next.hbs'),
      template: path.join($template, 'next.webpack.hbs'),
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
}
