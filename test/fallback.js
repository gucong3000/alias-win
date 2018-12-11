"use strict";
const testcase = require("./testcase");
const fallback = require("../src/fallback");
const fs = require("fs");
const expect = require("chai").expect;

testcase("fallback");
describe("fallback", () => {
	let fsBak;
	before(() => {
		fsBak = Object.assign({}, fs);
	});

	after(() => {
		[
			"writeFileSync",
			"unlinkSync",
			"writeFile",
			"unlink",
		].map(fnName => {
			fs[fnName] = fsBak[fnName];
		});
	});

	it("Do not use MACROFILE for add", async () => {
		expect(
			await fallback.set({
				"t1": "1",
			})
		).to.equal(true);
	});

	it("Do not use MACROFILE for remove", async () => {
		expect(
			await fallback.set({
				"t1": null,
			})
		).to.equal(true);
	});

	it("skip empty object", async () => {
		expect(
			await fallback.set({})
		).to.equal(true);
	});

	it("throw error for fallback.setSync()", () => {
		fs.writeFileSync = 1;
		expect(() => {
			fallback.setSync({
				"t1": "中文",
			});
		}).to.throw("is not a function");
	});

	it("reject error for fallback.set()", async () => {
		const mockError = new Error("message", "mock reject  error");
		fs.writeFile = (...args) => {
			const callback = args.pop();
			callback(mockError);
		};
		let error;
		try {
			await fallback.set({
				"t1": "中文",
			});
		} catch (ex) {
			error = ex;
		}
		expect(error).to.equal(mockError);
	});
});
