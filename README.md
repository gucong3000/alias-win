alias-win
====
[![NPM version](https://img.shields.io/npm/v/alias-win.svg?style=flat-square)](https://www.npmjs.com/package/alias-win)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/alias-win.svg)](https://ci.appveyor.com/project/gucong3000/alias-win)
[![Codecov](https://img.shields.io/codecov/c/github/gucong3000/alias-win.svg)](https://codecov.io/gh/gucong3000/alias-win)
[![David](https://img.shields.io/david/gucong3000/alias-win.svg)](https://david-dm.org/gucong3000/alias-win)

An effort to encapsulate aliases used by the console of current process.

This library provides native bindings for Windows APIs:
- [AddConsoleAlias](https://docs.microsoft.com/windows/console/addconsolealias)
- [GetConsoleAliases](https://docs.microsoft.com/windows/console/getconsolealiases)

## Usage

```javascript
const alias = require("alias-win");
alias.get().then(console.log);
```

## API

### alias.get([exeName])

Get console aliases for the specified executable.

```js
console.log(await alias.get())
```

### alias.getSync([exeName])

For detailed information, see the documentation of the asynchronous version of this API: `alias.get()`.

### alias.set(aliases, [exeName])

Set console aliases for the specified executable.

```js
await alias.set({
  sudo: "$*",
  ll: "ls -l $*",

  // Use `null` to unset an alias
  bash: null,
});
```

### alias.setSync(aliases, [exeName])

For detailed information, see the documentation of the asynchronous version of this API: `alias.set()`.

## CLI

The console aliases may be set and unset with the `alias` and `unalias` commands.
For detailed information, see [the documentation of bash](https://www.gnu.org/software/bash/manual/bash.html#Aliases)

## Related
- [Console Aliases](https://docs.microsoft.com/windows/console/console-aliases)
- [doskey](https://docs.microsoft.com/windows-server/administration/windows-commands/doskey)
