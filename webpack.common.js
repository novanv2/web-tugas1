const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/index.js"),
    sw: path.resolve(__dirname, "src/scripts/sw.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: (chunkData) => {
      return chunkData.chunk.name === "sw" ? "sw.js" : "bundle.js";
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "images",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      excludeChunks: ["sw"],
      filename: "index.html",
      inject: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/app.webmanifest'),
          to: 'app.webmanifest',
        },
        {
          from: path.resolve(__dirname, 'src/public/icons'),
          to: 'icons',
        },
      ],
    }),
  ],
};
