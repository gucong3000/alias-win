"use strict";
const expect = require("chai").expect;
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const alias = require("../src");
const unaliasCli = require("../src/unalias-cli");

async function exec (args, lang = "C") {
	const consoleBak = Object.assign({}, console);
	const stdoutIsTTY = process.stdout.isTTY;
	const stderrIsTTY = process.stderr.isTTY;
	const LANG = process.env.LANG;

	const stdout = [];
	const stderr = [];
	console.log = stdout.push.bind(stdout);
	console.error = stderr.push.bind(stderr);

	process.env.LANG = lang + ".UTF-8";
	process.stdout.isTTY = false;
	process.stderr.isTTY = false;
	try {
		return {
			stdout,
			stderr,
			status: await unaliasCli([].concat(args).filter(Boolean)),
		};
	} finally {
		Object.assign(console, consoleBak);
		process.env.LANG = LANG;
		process.stdout.isTTY = stdoutIsTTY;
		process.stderr.isTTY = stderrIsTTY;
	}
}

async function readResult (file) {
	return (await readFile("test/testcase/" + file + ".txt", "utf8")).trim();
}

describe("CLI: unalias", () => {
	let rawAliases;
	before(async () => {
		rawAliases = await alias.get();
		const mockAliases = {
			alias_a: "mock_a $*",
			alias_b: "mock_b $1",
			alias_c: "mock_c $T hehe",
		};
		Object.keys(rawAliases).forEach(key => {
			if (!mockAliases[key]) {
				mockAliases[key] = null;
			}
		});
		await alias.set(mockAliases);
	});

	after(async () => {
		await alias.set({
			...rawAliases,
			alias_a: null,
			alias_b: null,
			alias_c: null,
			alias_5: null,
			alias_6: null,
			alias_99: null,
		});
	});

	[
		"en",
		"zh_CN",
		"zh_TW",
	].forEach(lang => {
		it(lang + ": unalias --help", async () => {
			const result = await exec("--help", lang);
			expect(result.stderr).to.have.length(0);
			expect(result.stdout).to.deep.equal([
				await readResult("unalias_help." + lang),
			]);
			expect(result.status).to.equal(0);
		});

		it(lang + ": unalias", async () => {
			const result = await exec([], lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/unalias." + lang + ".txt", result.stderr.join("\n") + "\n");
			expect(result.stderr).to.deep.equal([
				await readResult("unalias." + lang),
			]);
			expect(result.status).to.equal(1);
		});

		it(lang + ": unalias -e", async () => {
			const result = await exec("-e", lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/unalias_invalid_option." + lang + ".txt", result.stderr.join("\n") + "\n");
			expect(result.stderr).to.deep.equal([
				await readResult("unalias_invalid_option." + lang),
			]);
			expect(result.status).to.equal(1);
		});

		it(lang + ": unalias alias_0 alias_a", async () => {
			await alias.set({
				alias_0: "niu",
				alias_a: null,
			});
			const result = await exec([
				"alias_0",
				"alias_a",
			], lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/unalias_not_found." + lang + ".txt", result.stderr.join("\n") + "\n");
			expect(result.stderr).to.deep.equal([
				await readResult("unalias_not_found." + lang),
			]);
			expect(result.status).to.equal(1);
			const aliases = alias.get();
			expect(aliases).to.not.have.property("alias_0");
			expect(aliases).to.not.have.property("alias_a");
		});

		it(lang + ": unalias alias_a", async () => {
			const result = await exec([
				"alias_a",
			], lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/unalias_not_found." + lang + ".txt", result.stderr.join("\n") + "\n");
			expect(result.stderr).to.deep.equal([
				await readResult("unalias_not_found." + lang),
			]);
			expect(result.status).to.equal(1);
			const aliases = alias.get();
			expect(aliases).to.not.have.property("alias_a");
		});
	});

	it("unalias -a", async () => {
		const result = await exec("-a");
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.have.length(0);
		expect(result.status).to.equal(0);
		for (const name in alias.get()) {
			expect(name).to.match(/^(?:un)?alias$/);
		}
	});
});
