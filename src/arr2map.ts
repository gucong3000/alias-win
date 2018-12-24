"use strict";
function arr2map (aliases, separator) {
	const result = {};
	aliases && aliases.split(separator).forEach(alias => {
		alias = /^(.*?)=(.*?)$/.exec(alias);
		if (alias) {
			result[alias[1]] = alias[2];
		}
	});
	return result;
}
module.exports = arr2map;
