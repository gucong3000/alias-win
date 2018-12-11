"use strict";
const util = require("util");
if (!util.promisify) {
	util.promisify = require("util.promisify");
}
if (parseInt(process.versions.v8) < 6) {
	require("@babel/register");
}
