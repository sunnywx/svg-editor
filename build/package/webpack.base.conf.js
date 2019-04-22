const path = require('path');
const WebpackBar = require('webpackbar');
const utils = require('../utils');
const config = require('../../config');

const resolve = dir => path.join(__dirname, '../..', dir);

module.exports = {
    entry: {
        raphy: './raphy/index.js'
    },
    output: {
        path: config.package.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
            ? config.package.assetsPublicPath
            : config.dev.assetsPublicPath,
        libraryTarget: 'umd',
        library: 'raphy'
    },
    externals: {
      // eventemitter2: 'EventEmitter2',
      // 'array-to-tree': 'array-to-tree',
      // 'svg.js': 'svg.js'
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_'
      },
      eventemitter2: {
        root: 'EventEmitter2',
        commonjs2: 'eventemitter2',
        commonjs: 'eventemitter2',
        amd: 'eventemitter2'
      },
      'svg.js': {
        root: 'SVG',
        commonjs2: 'svg.js',
        commonjs: 'svg.js',
        amd: 'svg.js'
      },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            resolve('src'),
            resolve('raphy'),
            resolve('node_modules')
        ],
        alias: {
            'src': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components'),
            'routes': resolve('src/routes'),
            'views': resolve('src/views'),
            'raphy': resolve('raphy')
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [resolve('src'), resolve('raphy'), resolve('test')],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('raphy'), resolve('test')],
                options: {
                    cacheDirectory: true
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    plugins: [new WebpackBar()]
};
