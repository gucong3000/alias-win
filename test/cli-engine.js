"use strict";
const expect = require("chai").expect;
const cliEngine = require("../src/cli-engine");

describe("CLI: alias", () => {
	let lang;
	let consoleBak;
	let stdoutIsTTY;
	let stderrIsTTY;
	before(async () => {
		consoleBak = Object.assign({}, console);
		lang = process.env.LANG;
		stdoutIsTTY = process.stdout.isTTY;
		stderrIsTTY = process.stderr.isTTY;
	});

	after(() => {
		Object.assign(console, consoleBak);
		process.env.LANG = lang;
		process.stdout.isTTY = stdoutIsTTY;
		process.stderr.isTTY = stderrIsTTY;
	});

	it("cliEngine.gettext()", async () => {
		const cli = await cliEngine([]);
		expect(cli.gettext("test_mock")).to.equal("test_mock");
	});

	it("ANSI escape codes", async () => {
		// eslint-disable-next-line no-control-regex
		const reAnsi = /\u001b\[1m(.*?)\u001b\[0m/g;
		process.stdout.isTTY = false;
		process.stderr.isTTY = true;
		process.env.LANG = "en";
		const stdout = [];
		const stderr = [];
		console.log = stdout.push.bind(stdout);
		console.error = stderr.push.bind(stderr);
		const cli = await cliEngine([]);
		const msg = cli.gettext("`%s': invalid alias name", "mock");
		cli.log(msg);
		cli.error(msg);
		Object.assign(console, consoleBak);
		expect(msg).to.match(reAnsi);
		expect(stdout).to.deep.equal([
			msg.replace(reAnsi, "$1"),
		]);
		expect(stderr).to.deep.equal([
			msg,
		]);
	});
});
