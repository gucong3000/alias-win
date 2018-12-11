"use strict";
const expect = require("chai").expect;

function testcase (id) {
	const module = require("../src/" + id);
	describe(id, () => {
		it(`${id}.setSync()`, () => {
			expect(module.setSync({
				[`${id}_testcase`]: `${id} alias some test`,
				[`${id}_UTF8`]: `${id} alias some test 中文`,
			})).to.equal(true);
		});

		it(`${id}.getSync()`, () => {
			const aliases = module.getSync();
			expect(aliases).to.have.property(`${id}_testcase`, `${id} alias some test`);
			expect(aliases).to.have.property(`${id}_UTF8`, `${id} alias some test 中文`);
		});

		it(`${id}.setSync() remove`, () => {
			expect(module.setSync({
				[`${id}_testcase`]: null,
				[`${id}_UTF8`]: null,
			})).to.equal(true);
		});

		it(`${id}.getSync() remove`, () => {
			const aliases = module.getSync();
			expect(aliases).to.not.have.property(`${id}_testcase`);
			expect(aliases).to.not.have.property(`${id}_UTF8`);
		});

		it(`${id}.set()`, async () => {
			expect(await module.set({
				[`${id}_testcase`]: `${id} alias some test`,
				[`${id}_UTF8`]: `${id} alias some test 中文`,
			})).to.equal(true);
		});

		it(`${id}.get()`, async () => {
			const aliases = await module.get();
			expect(aliases).to.have.property(`${id}_testcase`, `${id} alias some test`);
			expect(aliases).to.have.property(`${id}_UTF8`, `${id} alias some test 中文`);
		});

		it(`${id}.set() remove`, async () => {
			expect(await module.setSync({
				[`${id}_testcase`]: null,
				[`${id}_UTF8`]: null,
			})).to.equal(true);
		});

		it(`${id}.get() remove`, async () => {
			const aliases = await module.getSync();
			expect(aliases).to.not.have.property(`${id}_testcase`);
			expect(aliases).to.not.have.property(`${id}_UTF8`);
		});

		it(`${id}.set({ mock_0: "0", mock_8: "8" }, "mock.exe")`, async () => {
			expect(await module.set(
				{
					mock_0: "0",
					mock_8: "8",
				},
				"mock.exe"
			)).to.equal(true);
		});

		it(`${id}.get("mock.exe")`, async () => {
			const aliases = await module.get("mock.exe");
			expect(aliases).deep.equal({
				mock_0: "0",
				mock_8: "8",
			});
		});

		it(`${id}.set({ mock_0: null, mock_8: null }, "mock.exe")`, async () => {
			expect(await module.set(
				{
					mock_0: null,
					mock_8: null,
				},
				"mock.exe"
			)).to.equal(true);
		});

		it(`${id}.get("mock.exe")`, async () => {
			const aliases = await module.get("mock.exe");
			expect(aliases).deep.equal({});
		});
	});
}
module.exports = testcase;
