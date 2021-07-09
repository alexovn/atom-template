const webpack = require('webpack'); 
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
        splitChunks: {
            cacheGroups: {
                vendorJS: {
                    name: 'vendor',
                    test: /[\\/]node_modules[\\/]|files[\\/]/,
                    chunks: 'all',
                    enforce: true,
                },
            }
        },
    },
    output: {
        filename: '[name].bundle.min.js',
        chunkFilename: '[name].bundle.min.js',
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
};