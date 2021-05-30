const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendorJS: {
                    name: 'vendor',
                    test: /[\\/]node_modules[\\/]|plugins[\\/]/,
                    chunks: 'all',
                    enforce: true,
                },
                vendorCSS: {
                    name: 'vendor',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                  },
            }
        },
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
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
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "../css/[name].min.css",
        })
    ],
};