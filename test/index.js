"use strict";
const binary = require("node-pre-gyp");
const expect = require("chai").expect;
const alias = require("../src");

describe("index", () => {
	it("alias.setSync()", () => {
		expect(
			alias.setSync({
				alias_a: "mock_a",
				alias_b: "mock_b $1",
				alias_c: "mock_c $T hehe",
			})
		).to.equal(true);
	});

	it("alias.getSync()", async () => {
		const result = alias.getSync();
		expect(result).to.have.property("alias_a", "mock_a");
		expect(result).to.have.property("alias_b", "mock_b $1");
		expect(result).to.have.property("alias_c", "mock_c $T hehe");
	});

	it("alias.set({xxx: null})", async () => {
		expect(
			await alias.set({
				alias_a: null,
				alias_b: null,
				alias_c: null,
			})
		).to.equal(true);
	});

	it("alias.get()", async () => {
		const result = await alias.get();
		expect(result).to.not.have.property("alias_a");
		expect(result).to.not.have.property("alias_b");
		expect(result).to.not.have.property("alias_c");
	});

	it("alias.set(null)", () => {
		expect(() => {
			alias.set(null);
		}).throw(/`aliases` should be a object\./);
	});

	it("alias.setSync(\"throw\")", () => {
		expect(() => {
			alias.setSync("throw");
		}).throw(/`aliases` should be a object\./);
	});

	it("alias.set({ test: 1 })", () => {
		expect(() => {
			alias.set(
				{ test: 1 }
			);
		}).throw(/`aliases.test` should be a string\./);
	});

	it("alias.get(true)", () => {
		expect(() => {
			alias.get(true);
		}).throw("`exeName` should be a string.");
	});

	it("alias.getSync(true)", () => {
		expect(() => {
			alias.getSync(true);
		}).throw("`exeName` should be a string.");
	});

	it("alias.set({}, true)", () => {
		expect(() => {
			alias.set({}, true);
		}).throw("`exeName` should be a string.");
	});

	it("alias.setSync({}, true)", () => {
		expect(() => {
			alias.setSync({}, true);
		}).throw("`exeName` should be a string.");
	});
});

describe("fallback to js", () => {
	let binFind;
	let envBak;
	before(() => {
		delete require.cache[require.resolve("../src")];
		delete require.cache[require.resolve("../src/binding")];
		delete require.cache[require.resolve("../src/fallback")];
		envBak = Object.assign({}, process.env);
		binFind = binary.find;
	});
	after(() => {
		binary.find = binFind;
		process.env = Object.assign(process.env, envBak);
	});
	it("binary.find = null", () => {
		binary.find = null;
		delete process.env.windir;
		delete process.env.SystemRoot;
		require("../src");
		expect(require.cache[require.resolve("../src/binding")]).to.equal(undefined);
		expect(require.cache[require.resolve("../src/fallback")]).to.have.property("loaded", true);
	});
});
