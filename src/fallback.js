"use strict";
const childProcess = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const arr2map = require("./arr2map");

const doskeyExec = path.join(
	process.env.windir || process.env.SystemRoot || "C:/Windows",
	"System32/doskey.exe"
);
const doskeyOpts = {
	stdio: [
		"inherit",
		"pipe",
		"ignore",
	],
	env: {},
	windowsVerbatimArguments: true,
	encoding: "utf-8",
};
const MAX_ASCII_CHAR_CODE = 127;
const fsSync = {};

function fnSync (fs, fnName) {
	return function () {
		const args = Array.from(arguments);
		const callback = args.pop();
		try {
			callback(null, fs[fnName].apply(fs, args));
		} catch (ex) {
			callback(ex);
		}
	};
}

function isAscii (str) {
	for (let i = 0, strLen = str.length; i < strLen; ++i) {
		if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) {
			return false;
		};
	}
	return true;
};

function doskeyAsync (args, callback) {
	const doskey = childProcess.spawn(doskeyExec, args, doskeyOpts);
	const stdout = [];
	doskey.stdout.on("data", stdout.push.bind(stdout));
	doskey.on("close", (code) => {
		// eslint-disable-next-line standard/no-callback-literal
		callback({
			status: code || 0,
			stdout: Buffer.concat(stdout).toString(doskeyOpts.encoding),
		});
	});
}

function doskeySync (args, callback) {
	callback(childProcess.spawnSync(doskeyExec, args, doskeyOpts));
}

function getHelper (doskey, exeName, callback) {
	let arg = "/macros";
	if (exeName) {
		arg += ":" + exeName;
	}
	doskey([arg], (result) => {
		callback(null, arr2map(result.stdout, /[\r\n]+/g));
	});
}

function setHelper (doskey, fs, aliasSet, exeName, callback) {
	const aliases = [];
	for (const name in aliasSet) {
		aliases.push(`${name}=${aliasSet[name] || ""}`);
	}

	if (!aliases.length) {
		callback(null, true);
	}

	function updateAliases (macro, callback) {
		const args = [
			macro,
		];
		if (exeName) {
			args.unshift(
				"/exename=" + exeName
			);
		}
		doskey(args, (result) => {
			callback(null, !result.status);
		});
	}

	if (aliases.length === 1 && isAscii(aliases[0])) {
		updateAliases(aliases[0], callback);
	} else {
		const tmpFile = path.join(os.tmpdir(), "alias-" + Math.random());
		fs.writeFile(
			tmpFile,
			aliases.join(os.EOL),
			error => {
				if (error) {
					callback(error);
				} else {
					updateAliases(
						"/macrofile=" + tmpFile,
						(error, result) => {
							fs.unlink(tmpFile, () => {
								callback(error, result);
							});
						}
					);
				}
			}
		);
	}
}

function cb2sync (fn, args) {
	let err;
	let rst;
	fn.apply(this, args.concat((error, result) => {
		err = error;
		rst = result;
	}));
	if (err) {
		throw err;
	}
	return rst;
}

function cb2promise (fn, args) {
	return new Promise((resolve, reject) => {
		fn.apply(this, args.concat((error, result) => {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		}));
	});
}

function get (exeName) {
	return cb2promise(getHelper, [doskeyAsync, exeName]);
}

function getSync (exeName) {
	return cb2sync(getHelper, [doskeySync, exeName]);
}

function set (aliases, exeName) {
	return cb2promise(setHelper, [doskeyAsync, fs, aliases, exeName]);
}

function setSync (aliases, exeName) {
	return cb2sync(setHelper, [doskeySync, fsSync, aliases, exeName]);
}

[
	"writeFile",
	"unlink",
].map(fnName => {
	fsSync[fnName] = fnSync(fs, fnName + "Sync");
});

module.exports = {
	get,
	set,
	getSync,
	setSync,
};
