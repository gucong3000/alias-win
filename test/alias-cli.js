"use strict";
const expect = require("chai").expect;
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const alias = require("../src");
const aliasCli = require("../src/alias-cli");

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
			status: await aliasCli([].concat(args).filter(Boolean)),
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

describe("CLI: alias", () => {
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

	it("alias", async () => {
		const result = await exec();
		expect(result.stderr).to.have.length(0);
		expect(
			result.stdout
		).to.deep.equal([
			"alias alias_a='mock_a'",
			"alias alias_b='mock_b $1'",
			"alias alias_c='mock_c $T hehe'",
		]);
		expect(result.status).to.equal(0);
	});

	it("alias -p", async () => {
		const result = await exec("-p");
		expect(result.stderr).to.have.length(0);
		expect(
			result.stdout
		).to.deep.equal([
			"alias alias_a='mock_a'",
			"alias alias_b='mock_b $1'",
			"alias alias_c='mock_c $T hehe'",
		]);
		expect(result.status).to.equal(0);
	});

	it("alias alias_c", async () => {
		const result = await exec("alias_c");
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.deep.equal([
			"alias alias_c='mock_c $T hehe'",
		]);
		expect(result.stdout).to.have.length(1);
		expect(result.status).to.equal(0);
	});

	it("alias alias_5=5 alias_5", async () => {
		const result = await exec([
			"alias_5=5",
			"alias_5",
		]);
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.deep.equal([
			"alias alias_5='5'",
		]);
		expect(result.status).to.equal(0);
	});

	it("alias \"alias_6=6 $*\" alias_6", async () => {
		const result = await exec([
			"alias_6=6 $*",
			"alias_6",
		]);
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.deep.equal([
			"alias alias_6='6'",
		]);
		expect(result.status).to.equal(0);
	});

	it("alias \"alias_5=5 $* && echo hello\" alias_5", async () => {
		const result = await exec([
			"alias_5=5 $* && echo hello",
			"alias_5",
		]);
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.deep.equal([
			"alias alias_5='5 $* && echo hello'",
		]);
		expect(result.status).to.equal(0);
	});

	it("alias alias_5 alias_99", async () => {
		const result = await exec([
			"alias_5",
			"alias_99",
		]);
		expect(result.stdout).to.deep.equal([
			"alias alias_5='5 $* && echo hello'",
		]);
		expect(result.stderr).to.deep.equal([
			"cmd: alias: alias_99: not found",
		]);
		expect(result.status).to.equal(1);
	});

	it("alias -p \"alias_5=5 $* && echo hello\" alias_5", async () => {
		const result = await exec([
			"-p",
			"alias_5=5 $* && echo hello",
			"alias_6=6 $* && echo 6",
			"alias_5",
			"alias_6",
		]);
		expect(result.stderr).to.have.length(0);
		expect(result.stdout).to.contains(
			"alias alias_5='5 $* && echo hello'"
		);
		expect(result.stdout).to.contains(
			"alias alias_6='6 $* && echo 6'"
		);
		expect(result.status).to.equal(0);
	});

	[
		"en",
		"zh_CN",
		"zh_TW",
	].forEach(lang => {
		it(lang + ": alias --help", async () => {
			const result = await exec("--help", lang);
			expect(result.stderr).to.have.length(0);
			// fs.writeFileSync("test/testcase/alias_help." + lang + ".txt", result.stdout);
			expect(result.stdout).to.deep.equal([
				await readResult("alias_help." + lang),
			]);
			expect(result.status).to.equal(0);
		});

		it(lang + ": alias -e", async () => {
			const result = await exec("-e", lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/alias_invalid_option." + lang + ".txt", result.stderr);
			expect(result.stderr).to.deep.equal([
				await readResult("alias_invalid_option." + lang),
			]);
			expect(result.status).to.equal(1);
		});

		it(lang + ": alias notexists", async () => {
			const result = await exec("notexists", lang);
			expect(result.stdout).to.have.length(0);
			// fs.writeFileSync("test/testcase/alias_notexists." + lang + ".txt", result.stderr);
			expect(result.stderr).to.deep.equal([
				await readResult("alias_notexists." + lang),
			]);
			expect(result.status).to.equal(1);
		});
	});
});
