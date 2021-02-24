/* eslint-env node */
"use strict";
const {join} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "production",
	context: __dirname,
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	entry: "./src/application.tsx",
	output: {
		path: join(__dirname, "dist"),
		publicPath: "/"
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js)$/u,
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
