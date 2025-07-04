const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: './dist',
        compress: true,
        port: 8080,
        open: true,
        hot: true
    }
});
