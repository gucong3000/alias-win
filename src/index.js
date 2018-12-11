"use strict";
let binding;
try {
	binding = require("./binding");
} catch (ex) {
	binding = require("./fallback");
}

function validateString (value, name) {
	if (!value || typeof value !== "string") {
		throw new TypeError(`${name} should be a string.`);
	}
}

function validateOptionalString (value, name) {
	if (value != null) {
		validateString(value, name || "`exeName`");
	}
}

function validateOpts (aliases) {
	if (!aliases || typeof aliases !== "object") {
		throw new TypeError("`aliases` should be a object.");
	}
	for (const name in aliases) {
		validateString(name, "alias name");
		validateOptionalString(aliases[name], `\`aliases.${name}\``);
	}
}

function set (aliases, exeName) {
	validateOpts(aliases);
	validateOptionalString(exeName);
	return binding.set(aliases, exeName);
}

function setSync (aliases, exeName) {
	validateOpts(aliases);
	validateOptionalString(exeName);
	return binding.setSync(aliases, exeName);
}

function get (exeName) {
	validateOptionalString(exeName);
	return binding.get(exeName);
}

function getSync (exeName) {
	validateOptionalString(exeName);
	return binding.getSync(exeName);
}

module.exports = {
	get: get,
	set: set,
	getSync: getSync,
	setSync: setSync,
};
