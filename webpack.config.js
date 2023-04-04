/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/lit/action/PkpBtcSwapEth.ts",
  output: {
    filename: "PkpBtcSwap.bundle.js",
    path: path.resolve(__dirname, "src/lit/action/javascript"),
  },
  resolve: {
    extensions: [".ts", ".js"],
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
};
