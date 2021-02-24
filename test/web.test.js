/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual, strictEqual} = require("assert");
const {join} = require("path");
const express = require("express");
const {chromium} = require("playwright");
const {emptyDir} = require("fs-extra");
const {cmd} = require("./cmd.js");
const fixtures = join(__dirname, "web");

async function reset(id) {
	await emptyDir(join(fixtures, id, "out"));
	await emptyDir(join(fixtures, id, "dist"));
}

async function passesTypecheck(id) {
	const actual = await cmd(`npx tsc --build test/web/${id}/tsconfig.json`);
	deepStrictEqual(actual.errors, [], "No typecheck error");
}
async function failsTypecheck(id) {
	const actual = await cmd(`npx tsc --build test/web/${id}/tsconfig.json`);
	if (actual.errors.length === 0) {
		throw new Error("Expected a typecheck error");
	}
}

async function passesBuild(id) {
	const actual = await cmd(`npx webpack --config test/web/${id}/webpack.config.js`);
	deepStrictEqual(actual.errors, [], "No build error");
}
async function failsBuild(id) {
	const actual = await cmd(`npx webpack --config test/web/${id}/webpack.config.js`);
	if (actual.errors.length === 0) {
		throw new Error("Expected a build error");
	}
}

async function passesRuntime(id, expected) {
	const folder = join(fixtures, id, "dist");
	const app = express();
	app.use(express.static(folder));
	const server = app.listen(3000);

	let actual = "";
	try {
		const browser = await chromium.launch();
		try {
			const ctx = await browser.newContext();
			const page = await ctx.newPage();
			await page.goto("http://localhost:3000/", {waitUntil: "networkidle"});
			actual = await page.evaluate(() => {
				/* global document */
				const el = document.getElementById("hello");
				if (el === null) {
					return "Error: #hello not found";
				}
				return el.innerHTML;
			});
		} finally {
			await browser.close();
		}
	} finally {
		server.close();
	}
	strictEqual(actual, expected);
}

describe("Web: Basic", function () {
	it("Accepts: DOM", async function () {
		const id = "basic-dom";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[BASIC DOM] Type is object");
	});
	it("Accepts: CSS Modules", async function () {
		const id = "asset-import-css";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "mymodule__myclass");
	});
	it("Accepts: local modules", async function () {
		const id = "basic-local-modules";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[LOCAL MODULES] 123");
	});
	it("Accepts: relative path", async function () {
		const id = "basic-relative-path";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[RELATIVE PATH] 123");
	});
	it("Accepts: relative path, index.ts", async function () {
		const id = "basic-relative-path-index";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[RELATIVE PATH INDEX] 123");
	});
	it("Accepts: relative path, custom.ts, package.json", async function () {
		const id = "basic-relative-path-package";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[RELATIVE PATH PACKAGE] 123");
	});
});

describe('Web: Toplevel variables are global without "import" or "export"', function () {
	it("Fails typecheck: global, no export or import", async function () {
		const id = "entries";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES] Value is {"hello":"APP2"}');
	});
	it("Fails typecheck: Global, require", async function () {
		const id = "entries-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES REQUIRE] Value is {"hello":"APP2"}');
	});
	it("Accepts: local, export {}", async function () {
		const id = "entries-export";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES EXPORT] Value is {"hello":"APP2"}');
	});
	it("Accepts: local, import … from", async function () {
		const id = "entries-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES IMPORT FROM] Value is {"hello":"APP2"}');
	});
	it("Accepts: local, import * from", async function () {
		const id = "entries-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES IMPORT STAR] Value is {"hello":"APP2"}');
	});
	it("Fails typecheck: import = require", async function () {
		const id = "entries-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[ENTRIES IMPORT REQUIRE] Value is {"hello":"APP2"}');
	});
});

describe("Web: Import a CommonJS default object, without .d.ts", function () {
	it("Fails typecheck: import … from", async function () {
		const id = "commonjs-untyped-default-import-from";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED DEFAULT, IMPORT FROM] Type is function");
	});
	it("Fails typecheck: import * from", async function () {
		const id = "commonjs-untyped-default-import-star";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED DEFAULT, IMPORT STAR] Type is function");
	});
	it("Fails typecheck: import = require", async function () {
		const id = "commonjs-untyped-default-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED DEFAULT, IMPORT REQUIRE] Type is undefined");
	});
	it("Accepts: require", async function () {
		const id = "commonjs-untyped-default-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function");
	});
});

describe("Web: Import a CommonJS named function, without .d.ts", function () {
	it("Fails typecheck: import … from", async function () {
		const id = "commonjs-untyped-named-import-from";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED NAMED, IMPORT FROM] Type is function");
	});
	it("Fails: import * from", async function () {
		const id = "commonjs-untyped-named-import-star";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED NAMED, IMPORT STAR] Type is function");
	});
	it("Fails: import = require", async function () {
		const id = "commonjs-untyped-named-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it("Accepts: require", async function () {
		const id = "commonjs-untyped-named-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS UNTYPED NAMED, REQUIRE] Type is function");
	});
});

describe("Web: Import a CommonJS default object, with .d.ts", function () {
	it("Fails typecheck: import … from", async function () {
		const id = "commonjs-typed-default-import-from";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED DEFAULT, IMPORT FROM] Type is function");
	});
	it("Fails typecheck: import * from", async function () {
		const id = "commonjs-typed-default-import-star";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED DEFAULT, IMPORT STAR] Type is function");
	});
	it("Fails typecheck: import = require", async function () {
		const id = "commonjs-typed-default-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is undefined");
	});
	it("Accepts: require", async function () {
		const id = "commonjs-typed-default-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED DEFAULT, REQUIRE] Type is function");
	});
});

describe("Web: Import a CommonJS named function, with .d.ts", function () {
	it("Accepts: import … from", async function () {
		const id = "commonjs-typed-named-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED NAMED, IMPORT FROM] Type is function");
	});
	it("Accepts: import * from", async function () {
		const id = "commonjs-typed-named-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED NAMED, IMPORT STAR] Type is function");
	});
	it("Fails: import = require", async function () {
		const id = "commonjs-typed-named-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it("Accepts: require", async function () {
		const id = "commonjs-typed-named-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[COMMONJS TYPED NAMED, REQUIRE] Type is function");
	});
});

describe("Web: Import an ES Module default object", function () {
	it("Accepts: import … from", async function () {
		const id = "export-default-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}');
	});
	it("Accepts: import * from", async function () {
		const id = "export-default-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}');
	});
	it("Fails: import = require", async function () {
		const id = "export-default-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it('Accepts: require (wrapped in "{default: THEMODULE}")', async function () {
		const id = "export-default-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}');
	});
});

describe("Web: Import an ES Module named function", function () {
	it("Accepts: import … from", async function () {
		const id = "export-named-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[EXPORT NAMED, IMPORT FROM] Type is function");
	});
	it("Accepts: import * from", async function () {
		const id = "export-named-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[EXPORT NAMED, IMPORT STAR] Type is function");
	});
	it("Fails: import = require", async function () {
		const id = "export-named-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it("Accepts: require", async function () {
		const id = "export-named-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[EXPORT NAMED, REQUIRE] Type is function");
	});
});

describe("Web: Preact", function () {
	it("Accepts: h()", async function () {
		const id = "preact-h";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '<article class="example">[PREACT H] Hello World</article>');
	});
	it("Accepts: Class Component", async function () {
		const id = "preact-class";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '<article class="example">[PREACT CLASS] PROP Hello World STATE 123</article>');
	});
	it("Accepts: Functional Component", async function () {
		const id = "preact-function";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '<article class="example">[PREACT FUNCTION] Hello World</article>');
	});
	it("Accepts: TSX", async function () {
		const id = "preact-tsx";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '<article class="example">[PREACT TSX] Hello World</article>');
	});
});

describe("Web: JSON Array", function () {
	it("Fails typecheck: import … from", async function () {
		const id = "json-array-import-from";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON ARRAY IMPORT FROM is ["hello","world"]');
	});
	it("Accepts: import * from", async function () {
		const id = "json-array-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON ARRAY IMPORT STAR is {"0":"hello","1":"world","length":2,"default":["hello","world"]}');
	});
	it("Fails: import = require", async function () {
		const id = "json-array-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it("Accepts: require", async function () {
		const id = "json-array-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON ARRAY REQUIRE is ["hello","world"]');
	});
});

describe("Web: JSON Object", function () {
	it("Fails typecheck: import … from", async function () {
		const id = "json-object-import-from";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON OBJECT IMPORT FROM is {"example":["hello","world"]}');
	});
	it("Accepts: import * from", async function () {
		const id = "json-object-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON OBJECT IMPORT STAR is {"example":["hello","world"],"default":{"example":["hello","world"]}}');
	});
	it("Fails: import = require", async function () {
		const id = "json-object-import-require";
		await reset(id);
		await failsTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "Error: #hello not found");
	});
	it("Accepts: require", async function () {
		const id = "json-object-require";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, 'JSON OBJECT REQUIRE is {"example":["hello","world"]}');
	});
});

describe("Web: Assets", function () {
	it("Accepts: Image (url, resource)", async function () {
		const id = "asset-url-image-resource";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '<div>"http://localhost:3000/assets/example1.jpg"</div><div>"http://localhost:3000/assets/example2.png"</div><div>"http://localhost:3000/assets/example3.svg"</div>');
	});
	it("Accepts: Image (url, inline)", async function () {
		const id = "asset-url-image-inline";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "<div>BASE64 true</div><div>BASE64 true</div><div>BASE64 true</div>");
	});
	it("Accepts: Text (url, resource)", async function () {
		const id = "asset-url-text-resource";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, '"http://localhost:3000/assets/example.txt"');
	});
	it("Accepts: Text (url, inline)", async function () {
		const id = "asset-url-text-inline";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "BASE64 true");
	});
	it("Accepts: Text (url, source)", async function () {
		const id = "asset-url-text-source";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, `"http://localhost:3000/HELLO%20WORLD"`);
	});
	it("Accepts: Text (import, resource)", async function () {
		const id = "asset-import-text-resource";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, `<div>{"default":"/assets/example1.txt"}</div><div>"/assets/example2.txt"</div>`);
	});
	it("Accepts: Text (import, inline)", async function () {
		const id = "asset-import-text-inline";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "<div>BASE64 true</div><div>BASE64 true</div>");
	});
	it("Accepts: Text (import, source)", async function () {
		const id = "asset-import-text-source";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, `<div>{"default":"HELLO WORLD\\n"}</div><div>"HELLO WORLD\\n"</div>`);
	});
});

describe("Web: Include paths", function () {
	it("Accepts: src, no include", async function () {
		const id = "include-src-default";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[INCLUDE SRC DEFAULT] Type is object");
	});
	it("Accepts: src, inside include", async function () {
		const id = "include-src-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[INCLUDE SRC INSIDE] Type is object");
	});
	it("Fails: src, outside include", async function () {
		const id = "include-src-outside";
		await reset(id);
		await failsTypecheck(id);
		await failsBuild(id);
	});
	it("Accepts: custom path, no include", async function () {
		const id = "include-custom-default";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[INCLUDE CUSTOM DEFAULT] Type is object");
	});
	it("Accepts: custom path, inside include", async function () {
		const id = "include-custom-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[INCLUDE CUSTOM INSIDE] Type is object");
	});
	it("Accepts: custom path, outside include", async function () {
		const id = "include-custom-outside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[INCLUDE CUSTOM OUTSIDE] Type is object");
	});
});

describe("Web: Include node_modules", function () {
	it("Accepts: TS index, JS index, no include", async function () {
		const id = "npm-ts-index-default";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX DEFAULT] Value is 111");
	});
	it("Accepts: TS index.ts, inside list", async function () {
		const id = "npm-ts-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX INSIDE] Value is 111");
	});
	it("Accepts: TS index.ts, outside list", async function () {
		const id = "npm-ts-index-outside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX OUTSIDE] Value is 111");
	});
	it("Accepts: TS package.json, JS index, no include", async function () {
		const id = "npm-ts-package-default";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS PACKAGE DEFAULT] Value is 111");
	});
	it("Accepts: TS package.json, inside list", async function () {
		const id = "npm-ts-package-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS PACKAGE INSIDE] Value is 111");
	});
	it("Accepts: TS package.json, outside list", async function () {
		const id = "npm-ts-package-outside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS PACKAGE OUTSIDE] Value is 111");
	});
	it("Accepts: TS index, JS index, no include", async function () {
		const id = "npm-ts-index-js-index-default";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX JS INDEX DEFAULT] Value is 111 222");
	});
	it("Accepts: TS index inside, JS index inside", async function () {
		const id = "npm-ts-index-inside-js-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX INSIDE JS INDEX INSIDE] Value is 111 222");
	});
	it("Accepts: TS index outside, JS index inside", async function () {
		const id = "npm-ts-index-outside-js-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesBuild(id);
		await passesRuntime(id, "[NPM TS INDEX OUTSIDE JS INDEX INSIDE] Value is 111 222");
	});
});
