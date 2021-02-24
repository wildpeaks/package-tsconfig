/* eslint-env node, mocha */
/* eslint-disable prefer-arrow-callback */
"use strict";
const {deepStrictEqual} = require("assert");
const {emptyDir, copySync} = require("fs-extra");
const {join} = require("path");
const {cmd} = require("./cmd.js");
const fixtures = join(__dirname, "node");

async function reset(id) {
	await emptyDir(join(fixtures, id, "out"));
}

async function passesTypecheck(id) {
	const actual = await cmd(`npx tsc --build test/node/${id}/tsconfig.json`);
	deepStrictEqual(actual.errors, [], "No typecheck error");
}
async function failsTypecheck(id) {
	const actual = await cmd(`npx tsc --build test/node/${id}/tsconfig.json`);
	if (actual.errors.length === 0) {
		throw new Error("Expected a typecheck error");
	}
}

async function passesRuntime(id, filename, expected) {
	const actual = await cmd(`node test/node/${id}/${filename}`);
	deepStrictEqual(actual, {errors: [], output: expected}, "No runtime error");
}
async function failsRuntime(id, filename) {
	const actual = await cmd(`node test/node/${id}/${filename}`);
	if (actual.errors.length === 0) {
		throw new Error("Expected a runtime error");
	}
}

describe("Node: Basic", function () {
	it("Accepts: cli", async function () {
		const id = "basic-cli";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLI] Hello World"]);
	});
	it("Fails: local modules", async function () {
		const id = "basic-local-modules";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Accepts: relative path, index.ts", async function () {
		const id = "basic-relative-path";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[RELATIVE PATH] 123"]);
	});
	it("Accepts: relative path, index.ts", async function () {
		const id = "basic-relative-path-index";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[RELATIVE PATH INDEX] 123"]);
	});
	it("Fails: relative path, custom.ts, package.json", async function () {
		const id = "basic-relative-path-package";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
});

describe("Node: JSON", function () {
	it("Fails: import from", async function () {
		const id = "json-array-import-from";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: import * from", async function () {
		const id = "json-array-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[JSON ARRAY IMPORT STAR] is [\"hello\",\"world\"]"]);
	});
	it("Fails: import = require", async function () {
		const id = "json-array-import-require";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", [`[JSON ARRAY IMPORT REQUIRE] is ["hello","world"]`]);
	});
	it("Fails: require (without copy)", async function () {
		const id = "json-array-require";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Accepts: require (with copy)", async function () {
		const id = "json-array-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/data.json"),
			join(fixtures, id, "out/data.json")
		);
		await passesRuntime(id, "out/main.js", [`[JSON ARRAY REQUIRE] is ["hello","world"]`]);
	});
});

describe("Node: Import a CommonJS default object, without .d.ts", function () {
	it("Fails: import … from", async function () {
		const id = "commonjs-untyped-default-import-from";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Fails: import * from", async function () {
		const id = "commonjs-untyped-default-import-star";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Fails: import = require", async function () {
		const id = "commonjs-untyped-default-import-require";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: require", async function () {
		const id = "commonjs-untyped-default-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/index.js"),
			join(fixtures, id, "out/mymodule/index.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS UNTYPED DEFAULT, REQUIRE] Type is function"]);
	});
});

describe("Node: Import a CommonJS named function, without .d.ts", function () {
	it("Fails: import … from", async function () {
		const id = "commonjs-untyped-named-import-from";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Fails: import * from", async function () {
		const id = "commonjs-untyped-named-import-star";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Fails: import = require", async function () {
		const id = "commonjs-untyped-named-import-require";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: require", async function () {
		const id = "commonjs-untyped-named-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/index.js"),
			join(fixtures, id, "out/mymodule/index.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS UNTYPED NAMED, REQUIRE] Type is function"]);
	});
});

describe("Node: Import a CommonJS default object, with .d.ts", function () {
	it("Fails: import … from", async function () {
		const id = "commonjs-typed-default-import-from";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Fails: import * from", async function () {
		const id = "commonjs-typed-default-import-star";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: import = require", async function () {
		const id = "commonjs-typed-default-import-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED DEFAULT, IMPORT REQUIRE] Type is function"]);
	});
	it("Accepts: require", async function () {
		const id = "commonjs-typed-default-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED DEFAULT, REQUIRE] Type is function"]);
	});
});

describe("Node: Import a CommonJS named function, with .d.ts", function () {
	it("Accepts: import … from", async function () {
		const id = "commonjs-typed-named-import-from";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED NAMED, IMPORT FROM] Type is function"]);
	});
	it("Accepts: import * from", async function () {
		const id = "commonjs-typed-named-import-star";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED NAMED, IMPORT STAR] Type is function"]);
	});
	it("Accepts: import = require", async function () {
		const id = "commonjs-typed-named-import-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED NAMED, IMPORT REQUIRE] Type is function"]);
	});
	it("Accepts: require", async function () {
		const id = "commonjs-typed-named-require";
		await reset(id);
		await passesTypecheck(id);
		copySync(
			join(fixtures, id, "src/mymodule/package.json"),
			join(fixtures, id, "out/mymodule/package.json")
		);
		copySync(
			join(fixtures, id, "src/mymodule/mymodule.js"),
			join(fixtures, id, "out/mymodule/mymodule.js")
		);
		await passesRuntime(id, "out/main.js", ["[COMMONJS TYPED NAMED, REQUIRE] Type is function"]);
	});
});

describe("Node: Import an ES Module default object", function () {
	it("Accepts: import … from", async function () {
		const id = "export-default-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", [`[EXPORT DEFAULT, IMPORT FROM] Value is {"mynumber":123}`]);
	});
	it("Accepts: import * from", async function () {
		const id = "export-default-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", [`[EXPORT DEFAULT, IMPORT STAR] Value is {"default":{"mynumber":123}}`]);
	});
	it("Accepts: import = require", async function () {
		const id = "export-default-import-require";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", [`[EXPORT DEFAULT, IMPORT REQUIRE] Value is {"default":{"mynumber":123}}`]);
	});
	it(`Accepts: require (wrapped in "{default: THEMODULE}")`, async function () {
		const id = "export-default-require";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", [`[EXPORT DEFAULT, REQUIRE] Value is {"default":{"mynumber":123}}`]);
	});
});

describe("Node: Import an ES Module named function", function () {
	it("Accepts: import … from", async function () {
		const id = "export-named-import-from";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[EXPORT NAMED, IMPORT FROM] Type is function"]);
	});
	it("Accepts: import * from", async function () {
		const id = "export-named-import-star";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[EXPORT NAMED, IMPORT STAR] Type is function"]);
	});
	it("Accepts: import = require", async function () {
		const id = "export-named-import-require";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[EXPORT NAMED, IMPORT REQUIRE] Type is function"]);
	});
	it("Accepts: require", async function () {
		const id = "export-named-require";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[EXPORT NAMED, REQUIRE] Type is function"]);
	});
});

describe("Node: Class & Properties", function () {
	it("Fails: public property, not initialized", async function () {
		const id = "class-not-initialized";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: public property, initialized", async function () {
		const id = "class-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS INITIALIZED] number"]);
	});
	it("Accepts: public property, constructor", async function () {
		const id = "class-constructor-property-not-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS CONSTRUCTOR PROPERTY NOT INITIALIZED] number"]);
	});
	it("Accepts: public property, initialized, constructor", async function () {
		const id = "class-constructor-property-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS CONSTRUCTOR PROPERTY INITIALIZED] number"]);
	});
	it("Accepts: public property, generic type, constructor", async function () {
		const id = "class-generic-property-constructor";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS GENERIC PROPERTY CONSTRUCTOR] number"]);
	});
	it("Fails: public property, generic type, not initialized", async function () {
		const id = "class-generic-property-not-initialized";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: private property, getter setter, constructor", async function () {
		const id = "class-getter-setter-constructor";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS GETTER SETTER CONSTRUCTOR] number"]);
	});
	it("Accepts: private property, getter setter, initialized", async function () {
		const id = "class-getter-setter-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS GETTER SETTER INITIALIZED] number"]);
	});
	it("Fails: private property, getter setter, not initialized", async function () {
		const id = "class-getter-setter-not-initialized";
		await reset(id);
		await failsTypecheck(id);
	});
	it("Accepts: public property, optional, initialized", async function () {
		const id = "class-optional-property-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS OPTIONAL PROPERTY INITIALIZED] number"]);
	});
	it("Accepts: public property, optional, initialized, constructor", async function () {
		const id = "class-optional-property-initialized-constructor";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS OPTIONAL PROPERTY INITIALIZED CONSTRUCTOR] number"]);
	});
	it("Accepts: public property, optional", async function () {
		const id = "class-optional-property-not-initialized";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS OPTIONAL PROPERTY NOT INITIALIZED] undefined"]);
	});
	it("Accepts: public property, optional, constructor", async function () {
		const id = "class-optional-property-not-initialized-constructor";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[CLASS OPTIONAL PROPERTY NOT INITIALIZED CONSTRUCTOR] number"]);
	});
});

describe("Node: Include", function () {
	it("Accepts: custom path, default list", async function () {
		const id = "include-default";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[INCLUDE CUSTOM DEFAULT] Hello World"]);
	});
	it("Accepts: custom path, inside list", async function () {
		const id = "include-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/main.js", ["[INCLUDE CUSTOM INSIDE] Hello World"]);
	});
	it("Fails: custom path, outside list", async function () {
		const id = "include-outside";
		await reset(id);
		await failsTypecheck(id);
	});
});

describe("Node: Include node_modules", function () {
	it("Fails: TS index, JS index, no include", async function () {
		const id = "npm-ts-index-default";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Accepts: TS index.ts, inside list", async function () {
		const id = "npm-ts-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/src/main.js", ["[NPM TS INDEX INSIDE] Value is 111"]);
	});
	it("Fails: TS index.ts, outside list", async function () {
		const id = "npm-ts-index-outside";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Fails: TS package.json, JS index, no include", async function () {
		const id = "npm-ts-package-default";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Fails: TS package.json, inside list", async function () {
		const id = "npm-ts-package-inside";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/src/main.js");
	});
	it("Fails: TS package.json, outside list", async function () {
		const id = "npm-ts-package-outside";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Fails: TS index, JS index, no include", async function () {
		const id = "npm-ts-index-js-index-default";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
	it("Accepts: TS index inside, JS index inside", async function () {
		const id = "npm-ts-index-inside-js-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await passesRuntime(id, "out/src/main.js", ["[NPM TS INDEX INSIDE JS INDEX INSIDE] Value is 111 222"]);
	});
	it("Fails: TS index outside, JS index inside", async function () {
		const id = "npm-ts-index-outside-js-index-inside";
		await reset(id);
		await passesTypecheck(id);
		await failsRuntime(id, "out/main.js");
	});
});
