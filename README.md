#How to use the seed:
1) open init-seed.js
2) edit the `config` object
3) run with node this script
4) removes this instructions from the freshly created folder

---------

[![npm (scoped)](https://img.shields.io/npm/v/{{package-name}}.svg)](https://www.npmjs.com/package/{{package-name}})
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/{{package-name}}.svg)
![npm](https://img.shields.io/npm/dm/{{package-name}}.svg)
![NPM](https://img.shields.io/npm/l/{{package-name}}.svg)
![npm type definitions](https://img.shields.io/npm/types/{{package-name}}.svg)


## {{lib-name}} ##
To install:
```bash
yarn add {{package-name}}
# or 
npm i {{package-name}} --save
```

Entry point: `index.js`, others may contain some private or garbage experiment code. I recommend you to use rollup to import/bundle the package,
but you may use an already bundled version in `bundles/`.

You may also use unpkg: `https://unpkg.com/{{package-name}}`

[SOME EXAMPLES HERE](./examples/README.md)

