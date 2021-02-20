const $path = require('path');
const $fs = require('fs').promises;
const $fsh = require('../misc/fs-helpers.js');

const ROOT_PATH = $path.join(__dirname, '../../../');
const DIST_PATH = $path.join(ROOT_PATH, 'dist');
const DIST_CJS_PATH = $path.join(DIST_PATH, 'cjs');


function renameCJS() {
  return $fsh.createDirectory(DIST_CJS_PATH)
    .then(() => {
      return $fsh.exploreDirectory(DIST_CJS_PATH, (sourcePath, entry) => {
        if (entry.isFile()) {
          if (sourcePath.endsWith('.js')) {
            const newPath = `${ sourcePath.slice(0, -3) }.cjs`;
            return $fs.rename(sourcePath, newPath);
          }
        }
      });
    });
}

renameCJS()
  .catch((error) => {
    console.error(error);
  });


