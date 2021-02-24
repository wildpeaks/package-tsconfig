"use strict";
const {exec} = require("child_process");

function cmd(command) {
	return new Promise((resolve) => {
		exec(command, {}, (error, stdout, stderr) => {
			const output = stdout
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line !== "");
			const errors = stderr
				.trim()
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line !== "");
			if (error) {
				errors.push(error);
			}
			resolve({output, errors});
		});
	});
}

module.exports = {cmd};
