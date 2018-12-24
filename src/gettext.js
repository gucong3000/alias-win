"use strict";
const promisify = require("util").promisify;
const poParser = require("gettext-parser").po;
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function git (args) {
	return new Promise((resolve, reject) => {
		const process = cp.spawn("git", args, {
			stdio: "inherit",
			cwd: "bash",
		});
		process.on("error", reject);
		process.on("close", (code) => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
};

async function needInit () {
	try {
		await mkdir("bash");
		return true;
	} catch (ex) {
		return false;
	}
}

async function bash () {
	if (await needInit()) {
		await git(["init"]);
		await git([
			"remote",
			"add",
			"-f",
			"origin",
			"git://git.savannah.gnu.org/bash.git",
		]);
	}
	await git([
		"config",
		"core.sparsecheckout",
		"true",
	]);
	await writeFile(
		"bash/.git/info/sparse-checkout",
		"po/**/*"
	);
	await git([
		"pull",
		"--depth=1",
		"origin",
		"master",
	]);
}

async function lang (langPo) {
	let po = poParser.parse(await readFile(path.resolve("bash/po", langPo)));
	let language = po.headers.language;
	if (!language || !/^[a-z]+(?:_[A-Z]+)*$/.test(language)) {
		language = langPo.replace(/(?:@.+)?\.po$/, "");
	}
	po = po.translations[""];
	let translations = {};
	// let js;
	Object.keys(po).forEach(msgid => {
		if (!(
			msgid === "%s: usage: " ||
			msgid === "%s: not found" ||
			msgid === "%s: invalid option" ||
			/^[^\r\n]*(?:un)?alias(?:es)?/i.test(msgid)
		)) {
			return;
		}
		const value = po[msgid].msgstr[0];
		msgid = po[msgid].msgid || msgid;
		msgid = msgid.replace(/\r?\n[\s\S]*/, "");

		if (value) {
			translations[msgid] = value
				.replace(/^\s*(%\w+)\s*:\s*/, "$1: ")
				.replace(/\s*[:：]\s*$/, ": ")
				.replace(/\n +(?=\r?\n|$)/g, "\n")
				.replace(/ *\n/g, "\n");
		}
	});
	translations = JSON.stringify(
		translations,
		null,
		"\t"
	) + "\n";
	await writeFile(
		path.resolve("locales", language + ".json"),
		translations
	);
}

async function i18n () {
	let files = await readdir("bash/po");
	files = files.filter(file => file.endsWith(".po") && !file.startsWith("en@"));
	files.unshift("en@boldquot.po");
	await Promise.all(
		files.map(lang)
	);
}

bash().then(i18n);
