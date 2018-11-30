const path = require('path')

module.exports = {
    mode: 'development',
    entry: [
        'babel-polyfill',
        './src/index.js'
    ],
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env','stage-0','react']
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            }
        ]
    },
    output: {
        path: path.resolve(__dirname,'dist'),
        publicPath: path.resolve(__dirname,'dist'),
        filename: 'bundle.js'
    }
}