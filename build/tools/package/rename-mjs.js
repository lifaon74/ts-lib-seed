const $path = require('path');
const $fs = require('fs').promises;
const $fsh = require('../misc/fs-helpers.js');

const ROOT_PATH = $path.join(__dirname, '../../../');
const DIST_PATH = $path.join(ROOT_PATH, 'dist');


async function renameMJSFile(jsFilePath) {
  let jsFileContent = await $fs.readFile(jsFilePath, { encoding: 'utf8' });
  const jsFilePathWithoutExtension = jsFilePath.slice(0, -3);
  const mjsFilePath = `${ jsFilePathWithoutExtension }.mjs`;

  const sourceMappingURLCommentRegExp = new RegExp(`//# sourceMappingURL=([^\\s]+)(?:\\s|$)`);
  const match = sourceMappingURLCommentRegExp.exec(jsFileContent);
  if (match !== null) {
    const sourceMapFilePath = $path.join($path.dirname(jsFilePath), match[1]);
    const mjsSourceMapFilePath = `${ mjsFilePath }.map`;
    const jsMapFileContent = await $fs.readFile(sourceMapFilePath, { encoding: 'utf8' });
    const json = JSON.parse(jsMapFileContent);
    await $fs.writeFile(mjsSourceMapFilePath, JSON.stringify({
      ...json,
      file: $path.basename(mjsFilePath),
    }));

    jsFileContent = jsFileContent.slice(0, match.index)
      + `//# sourceMappingURL=${ $path.basename(mjsSourceMapFilePath) }`
      + jsFileContent.slice(match.index + match[0].length);
    await $fs.unlink(sourceMapFilePath);
  }
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


