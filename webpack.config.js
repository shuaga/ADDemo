"use strict";

const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  devServer: {
    port: 3000
  },
  output: {
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  mode: "development",
  devtool: "source-map"
};