"use strict";
const util = require("util");
if (!util.promisify) {
	util.promisify = require("util.promisify");
}
const babel = require("@babel/core");
require("@babel/register")({
	extensions: [".ts", ".tsx"].concat(babel.DEFAULT_EXTENSIONS),
});
