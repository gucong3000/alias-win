"use strict";
// https://github.com/gitGNU/gnu_ld/blob/master/po/
const stripAnsi = require("strip-ansi");
const path = require("path");
const util = require("util");
const alias = require(".");
const en = () => require("../locales/en.json");

function logger (stdio) {
	const logFn = console[stdio];
	stdio = stdio === "log" ? process.stdout : process.stderr;
	return function logger () {
		let args = arguments;
		if (!stdio.isTTY) {
			args = Array.prototype.map.call(args, stripAnsi);
		}
		return logFn.apply(console, args);
	};
}

function getLocale (lang = process.env.LANG) {
	if (lang && !/^(?:C|en(?:_[A-Z]+)?)(?=\.|$)/i.test(lang)) {
		lang = lang.replace(/\..*$/, "");
		try {
			return require(`../locales/${lang}.json`);
		} catch (ex) {
			//
		}
	}
	return en();
}

function cliInject (newAliases, oldAliases) {
	const keys = [
		"alias",
		"unalias",
	].filter(key => (!newAliases || newAliases[key] == null) && oldAliases[key] == null);
	if (!keys.length) {
		return newAliases;
	}

	const execName = path.basename(process.execPath, ".exe");
	newAliases = newAliases || {};

	keys.forEach(key => {
		newAliases[key] = `${execName} "${require.resolve("../bin/" + key)}" $*`;
	});
	return newAliases;
}

async function argv (argv) {
	const aliases = [];
	const args = [];
	argv.forEach(argv => {
		if (!aliases.length && argv[0] === "-") {
			if (argv[1] === "-") {
				args.push(argv);
			} else {
				args.push.apply(
					args,
					Array.prototype.slice.call(argv, 1)
						.map(arg => "-" + arg)
				);
			}
			return;
		}
		aliases.push(argv);
		return false;
	});

	let locale;
	let exitCode = 0;
	const error = logger("error");
	const oldAliases = await alias.get();
	let newAliases;

	const cliEngine = {
		save: async () => {
			newAliases = cliInject(newAliases, oldAliases);
			if (newAliases) {
				await alias.set(newAliases);
			}
			return exitCode;
		},
		aliases,
		args: Array.from(new Set(args)),
		get: () => oldAliases,
		set: (aliases) => {
			newAliases = aliases;
		},
		gettext: function () {
			if (!locale) {
				locale = getLocale();
			}
			const args = arguments;
			args[0] = locale[args[0]] || en()[args[0]] || args[0];
			return util.format.apply(util, args);
		},
		log: logger("log"),
		error: function () {
			exitCode = 1;
			return error.apply(console, arguments);
		},
	};

	return cliEngine;
}

module.exports = argv;
