/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
var webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/lit/action/PkpBtcSwapEth.ts",
  output: {
    filename: "PkpBtcSwap.bundle.js",
    path: path.resolve(__dirname, "src/lit/action/javascript"),
    publicPath: "",
    // module: true,
    chunkFormat: "module",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer"),
      events: require.resolve("events"),
      util: require.resolve("util"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
