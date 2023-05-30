/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const { LIT_SWAP_FILE_NAME } = require("./src/constants");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  mode: "production",
  entry: "./src/lit/action/InscriptionPkpSwap.ts",
  output: {
    filename: `${LIT_SWAP_FILE_NAME}.js`,
    path: path.resolve(__dirname, "src/lit/action/javascript"),
    publicPath: "",
    // module: true,
    chunkFormat: "module",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer"),
      events: require.resolve("events"),
      util: require.resolve("util"),
      url: require.resolve("url"),
      assert: require.resolve("assert"),
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

    new BundleAnalyzerPlugin(),
    // ...
  ],
};
