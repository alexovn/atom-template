module.exports = {
    mode: "production",
    optimization: {
        minimize: false,
    },
    output: {
        filename: 'app.js',
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env'],
                }
            },

            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
};