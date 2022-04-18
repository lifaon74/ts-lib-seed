[![npm (scoped)](https://img.shields.io/npm/v/{{package-name}}.svg)](https://www.npmjs.com/package/{{package-name}})
![npm](https://img.shields.io/npm/dm/{{package-name}}.svg)
![NPM](https://img.shields.io/npm/l/{{package-name}}.svg)
![npm type definitions](https://img.shields.io/npm/types/{{package-name}}.svg)

## {{lib-name}}


[SOME EXAMPLES HERE](examples/README.md)


## 📦 Installation

```bash
yarn add {{package-name}}
# or
npm install {{package-name}} --save
```

This library supports:

- **common-js** (require): transpiled as es5, with .cjs extension, useful for old nodejs versions
- **module** (esm import): transpiled as esnext, with .mjs extension (requires node resolution for external packages)

In a **node** environment the library works immediately (no extra tooling required),
however, in a **browser** environment, you'll probably need to resolve external imports thought a bundler like
[snowpack](https://www.snowpack.dev/),
[rollup](https://rollupjs.org/guide/en/),
[webpack](https://webpack.js.org/),
etc...
or directly using [skypack](https://www.skypack.dev/):
[https://cdn.skypack.dev/{{package-name}}](https://cdn.skypack.dev/{{package-name}})
