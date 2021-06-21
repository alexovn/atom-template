const webpack = require('webpack'); 
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    optimization: {
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
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ]
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
            {
                test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: "[name].[ext]",
                        outputPath: "../fonts/webfonts", 
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