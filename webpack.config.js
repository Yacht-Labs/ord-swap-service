/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
var webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/lit/action/PkpBtcSwapEth.ts",
  output: {
    filename: "PkpBtcSwap.bundle.js",
    path: path.resolve(__dirname, "src/lit/action/javascript"),
    publicPath: "",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: { stream: false, buffer: require.resolve("buffer/") },
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
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
};
