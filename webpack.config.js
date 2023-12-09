var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = {
  mode: "development",
  entry: {
    dist: './entries/entry.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'musicnotation-multichoice.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
      
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
          }
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: path.join(__dirname, 'src/fonts'),
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  }
  ,
  plugins: [
    new MiniCssExtractPlugin({
    filename: "musicnotation-multichoice.css"
      })
    ]
};

if(isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
