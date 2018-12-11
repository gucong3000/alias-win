#!/usr/bin/env node
"use strict";
require("../lib/unalias-cli")(process.argv.slice(2)).then(exitCode => { process.exitCode = exitCode; });
