#!/usr/bin/env node
"use strict";
require("../lib/alias-cli")(process.argv.slice(2)).then(exitCode => { process.exitCode = exitCode; });
