/**
 * Created by sajibsarkar on 12/13/17.
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins:[
        new HtmlWebpackPlugin({
        }),
        new webpack.NamedModulesPlugin()
    ],
    devServer: {
        contentBase: './dist'
    },
    node: {
        fs         : false,
        process    : false,
        Buffer     : false
    }
});
