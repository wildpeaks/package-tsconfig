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
	entry: {
		app1: "./src/application1.ts",
		app2: "./src/application2.ts"
	},
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
		new HtmlWebpackPlugin({
			filename: "index1.html",
			chunks: ["app1"]
		}),
		new HtmlWebpackPlugin({
			filename: "index.html",
			chunks: ["app2"]
		})
	]
};

