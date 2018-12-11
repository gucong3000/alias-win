"use strict";
const binary = require("node-pre-gyp");
const bindingPath = binary.find(require.resolve("../package.json"));
const binding = require(bindingPath);
const arr2map = require("./arr2map");

function getExeName (exeName) {
	return exeName || "cmd.exe";
}

function getSync (exeName) {
	// eslint-disable-next-line no-control-regex
	return arr2map(binding.get(getExeName(exeName)), /\u0000/g);
};

function setSync (aliases, exeName) {
	let result = true;
	exeName = getExeName(exeName);
	for (const name in aliases) {
		result = result && binding.setAlias(name, aliases[name] || null, exeName);
	}
	return result;
};

function get (exeName) {
	return Promise.resolve().then(() => (
		getSync(exeName)
	));
}

function set (aliases, exeName) {
	return Promise.resolve().then(() => (
		setSync(aliases, exeName)
	));
}

module.exports = {
	get,
	set,
	getSync,
	setSync,
};
