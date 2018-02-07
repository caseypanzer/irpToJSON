/**
 * Created by sajibsarkar on 12/13/17.
 */

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const klawSync = require('klaw-sync');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let appSrc;

try {
    appSrc = klawSync('./public/js', { nodir: true })
        .map(item => item.path)
        .filter(item => /\.js$/.test(item));
} catch (er) {
    console.error(er);
}

appSrc.unshift('./public/js/vendors.js');
//appSrc.unshift('webpack-hot-middleware/client?http://localhost:4444/__webpack_hmr');
appSrc.unshift('babel-polyfill');

module.exports = {
    entry: {
        app: appSrc
    },
    target: 'web',
    module: {
        loaders: [
            {
                test: /\.(css)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader?name=/fonts/[name].[ext]'
            },
            {
                test: /\.js?$/,
                include: path.join(__dirname, '../public/js'),
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            }
        ],
        noParse: [/jszip.js$/]
    },
    plugins: [
        new CleanWebpackPlugin(['../public/dist']),
        new ExtractTextPlugin('[name].css'),
        new webpack.ProvidePlugin({
            _: 'lodash',
            async: require('async'),
            moment: require('moment'),
            XLSX: require('xlsx')
        }),
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../public/dist'),
        publicPath: '/dist'
    },
    node: {
        fs: false,
        process: false,
        Buffer: true
    }
};
