/* eslint-env node */
"use strict";
const {join} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "production",
	context: __dirname,
	resolve: {
		extensions: [".ts", ".js"]
	},
	entry: "./custom-path/application.ts",
	output: {
		path: join(__dirname, "dist"),
		publicPath: "/"
	},
	module: {
		rules: [
			{
				test: /\.(ts|js)$/u,
				use: [
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true
						}
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin()
	]
};
