"use strict";
const cliEngine = require("./cli-engine");

async function unalias (cliEngine) {
	const usage = () => cliEngine.gettext("unalias [-a] name [name ...]");
	let removeAll = false;

	if (!(cliEngine.aliases.length + cliEngine.args.length)) {
		cliEngine.error(cliEngine.gettext("%s: usage: ", "unalias") + usage());
	} else if (cliEngine.args.indexOf("--help") >= 0) {
		cliEngine.log(`unalias: ${usage()}\n    ${cliEngine.gettext("Remove each NAME from the list of defined aliases.")}`);
	} else if (!cliEngine.args.some(arg => {
		if (arg === "-a") {
			removeAll = true;
		} else {
			cliEngine.error(
				cliEngine.gettext("%s: invalid option", "cmd: unalias: " + arg) +
				"\n" +
				cliEngine.gettext("%s: usage: ", "unalias") + usage()
			);
			return true;
		}
	})) {
		const oldAliases = cliEngine.get();
		const newAliases = {};
		if (removeAll) {
			for (const name in oldAliases) {
				if (!/^(?:un)?alias$/.test(name)) {
					newAliases[name] = null;
				}
			}
		} else {
			cliEngine.aliases.forEach(name => {
				if (name in oldAliases) {
					newAliases[name] = null;
				} else {
					cliEngine.error(cliEngine.gettext("%s: not found", "cmd: unalias:" + name));
				}
			});
		}
		cliEngine.set(newAliases);
	}
	return cliEngine.save();
}

module.exports = async (argv) => unalias(await cliEngine(argv));
