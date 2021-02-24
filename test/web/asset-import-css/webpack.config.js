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
	entry: "./src/application.ts",
	output: {
		path: join(__dirname, "dist"),
		publicPath: "/",
		assetModuleFilename: "assets/[name][ext]"
	},
	module: {
		rules: [
			{
				test: /\.css$/u,
				use: [
					{
						loader: "style-loader",
						options: {
							esModule: true,
							modules: {
								namedExport: true
							}
						}
					},
					{
						loader: "css-loader",
						options: {
							esModule: true,
							modules: {
								// localIdentName: "[path][name]__[local]--[hash:base64:5]",
								localIdentName: "mymodule__[local]",
								namedExport: true
							}
						}
					}
				]
			},
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
