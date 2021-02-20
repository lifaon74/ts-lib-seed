const $util = require('util')
const $path = require('path');
const $fs = require('fs').promises;
const $fsh = require('../misc/fs-helpers.js');
const $acorn = require('acorn');
const $acornWalk = require('acorn-walk');
const $escodegen = require('escodegen');

const ROOT_PATH = $path.join(__dirname, '../../../');
const DIST_PATH = $path.join(ROOT_PATH, 'dist');

function logObject(obj) {
  console.log($util.inspect(obj, false, null, true /* enable colors */))
}

function isPathRelative(path) {
  return path.startsWith('.');
}

function isRealPath(path) {
  return isPathRelative(path)
    || $path.isAbsolute(path);
}

// alternative shortcut

async function renameMJSFile(jsFilePath) {
  // if (!jsFilePath.includes('index')) {
  // if (!jsFilePath.includes('hello-world-named')) {
  // if (!jsFilePath.includes('hello-world-import')) {
  // if (!jsFilePath.includes('hello-world-import-all')) {
  //   return;
  // }

  let jsFileContent = await $fs.readFile(jsFilePath, { encoding: 'utf8' });
  const jsFilePathWithoutExtension = jsFilePath.slice(0, -3);
  const mjsFilePath = `${ jsFilePathWithoutExtension }.mjs`;

  // console.log(jsFileContent);
  // export / import .mjs ext
  {
    const tree = $acorn.parse(jsFileContent, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    });
    // logObject(tree);

    $acornWalk.full(tree, node => {
      switch (node.type) {
        case 'ImportExpression': {  // await import('./hello-world-lazy')
          if (node.source.type === 'Literal') { // only literal are currently supported
            const path = node.source.value;
            if (isRealPath(path)) {
              node.source.value = `${ path }.mjs`;
            }
          }
          break;
        }
        case 'ImportDeclaration': {  // import { helloWorldNamed } from './hello-world-named'; or import * as helloWorld from './hello-world-named';
          if (node.source.type === 'Literal') {
            const path = node.source.value;
            if (isRealPath(path)) {
              node.source.value = `${ path }.mjs`;
            }
          }
          break;
        }
        case 'ExportAllDeclaration': {  // export * from './src/index';
          const path = node.source.value;
          if (isRealPath(path)) {
            node.source.value = `${ path }.mjs`;
          }
          break;
        }
        case 'ExportNamedDeclaration': {  // export { helloWorldNamed } from './hello-world-named';
          if (node.source && (node.source.type === 'Literal')) {
            const path = node.source.value;
            if (isRealPath(path)) {
              node.source.value = `${ path }.mjs`;
            }
          }
          break;
        }
      }
    });

    jsFileContent = $escodegen.generate(tree);
  }

  // // source map
  // {
  //   const sourceMappingURLCommentRegExp = new RegExp(`//# sourceMappingURL=([^\\s]+)(?:\\s|$)`);
  //   const match = sourceMappingURLCommentRegExp.exec(jsFileContent);
  //   if (match !== null) {
  //     const sourceMapFilePath = $path.join($path.dirname(jsFilePath), match[1]);
  //     const mjsSourceMapFilePath = `${ mjsFilePath }.map`;
  //     const jsMapFileContent = await $fs.readFile(sourceMapFilePath, { encoding: 'utf8' });
  //     const json = JSON.parse(jsMapFileContent);
  //     await $fs.writeFile(mjsSourceMapFilePath, JSON.stringify({
  //       ...json,
  //       file: $path.basename(mjsFilePath),
  //     }));
  //
  //     jsFileContent = jsFileContent.slice(0, match.index)
  //       + `//# sourceMappingURL=${ $path.basename(mjsSourceMapFilePath) }`
  //       + jsFileContent.slice(match.index + match[0].length);
  //     await $fs.unlink(sourceMapFilePath);
  //   }
  // }
  //
  await $fs.writeFile(mjsFilePath, jsFileContent);
  await $fs.unlink(jsFilePath);
}


function renameMJS() {
  return $fsh.createDirectory(DIST_PATH)
    .then(() => {
      return $fsh.exploreDirectory(DIST_PATH, (entryPath, entry) => {
        if (entry.isFile()) {
          if (!entryPath.includes('/cjs/')) {
            if (entryPath.endsWith('.js')) {
              return renameMJSFile(entryPath);
            }
          }
        }
      });
    });
}

renameMJS()
  .catch((error) => {
    console.error(error);
  });


