# Typescript Config

![Github Release](https://img.shields.io/github/v/release/wildpeaks/package-tsconfig.svg?label=Release&logo=github&logoColor=eceff4&colorA=4c566a&colorB=11abfb)

Typescript settings for **ES2020** sources transpiled to **ES2017 ES Modules**.


---

## Quickstart

Install dependency:

	npm install @wildpeaks/tsconfig

Use in `tsconfig.json`:
````jsonc
{
	// Reference the shared config
	"extends": "@wildpeaks/tsconfig",

	// Override settings to fit your project
	"compilerOptions": {
		"lib": ["es2020", "dom"],
		"types": ["node", "webpack-env"],

		"jsx": "react-jsx",
		"jsxImportSource": "preact"
	},

	// If you run Mocha tests via ts-node,
	// you can make ts-node transpile to CJS
	// even if your project targets ESM
	"ts-node": {
		"skipIgnore": true,
		"transpileOnly": true,
		"compilerOptions": {
			"module": "CommonJS"
		}
	}
}
````
