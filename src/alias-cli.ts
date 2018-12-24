"use strict";
const cliEngine = require("./cli-engine");

function alias (cliEngine) {
	const usage = () => cliEngine.gettext("alias [-p] [name[=value] ... ]");
	const aliases = cliEngine.get();

	function hasArgs (value) {
		// https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/doskey
		return /\s*\$[*$\dGLBT]/i.exec(value);
	}

	function output (name, value) {
		const args = hasArgs(value);
		if (args && args.index + args[0].length === value.length && args[0] === " $*") {
			value = value.slice(0, args.index);
		}
		console.log(`alias ${name}='${value}'`);
	}

	function entries () {
		Object.keys(aliases).filter(
			name => !/^(?:;|(?:un)?alias)$/.test(name)
		).sort().forEach(name => {
			output(name, aliases[name]);
		});
	}

	if (!(cliEngine.aliases.length + cliEngine.args.length)) {
		entries();
	} else if (cliEngine.args.indexOf("--help") >= 0) {
		cliEngine.log(`alias: ${usage()}\n    ${cliEngine.gettext("Define or display aliases.")}`);
	} else if (!cliEngine.args.some(arg => {
		if (arg === "-p") {
			entries();
		} else {
			cliEngine.error(
				cliEngine.gettext("%s: invalid option", "cmd: alias: " + arg) +
				"\n" +
				cliEngine.gettext("%s: usage: ", "alias") + usage()
			);
			return true;
		}
	})) {
		const newAliases = {};

		for (let i = 0; i < cliEngine.aliases.length; i++) {
			const alias = cliEngine.aliases[i];
			const set = /^(.*?)=(.*)$/.exec(alias);
			if (set) {
				newAliases[set[1]] = hasArgs(set[2]) ? set[2] : set[2].replace(/\s*$/, " $*");
			} else {
				const value = newAliases[alias] || aliases[alias];
				if (value == null) {
					cliEngine.error(cliEngine.gettext("%s: not found", "cmd: alias: " + alias));
				} else {
					output(alias, value);
				}
			}
		}

		for (const name in newAliases) {
			if (aliases[name] === newAliases[name]) {
				delete newAliases[name];
			}
		}
		cliEngine.set(newAliases);
	}
	return cliEngine.save();
}

module.exports = async (argv) => alias(await cliEngine(argv));
