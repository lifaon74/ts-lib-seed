const $terser = require('terser');
const $fs = require('fs');
const $path = require('path');

module.exports = function makeTerser(sourcePath, _options = {}) {
  const source = $fs.readFileSync(sourcePath, 'utf8');

  const dest = sourcePath.replace(/.js$/, '.min.js');
  const sourceMapDest = dest + '.map';

  const options = Object.assign({
    // mangle: {
    //   properties: true,
    // },
    sourceMap: {
      filename: $path.basename(sourcePath),
      url: $path.basename(sourceMapDest)
    }
  }, _options);

  const result = $terser.minify(source, options);

  if (result.error) {
    throw result;
  } else {
    $fs.writeFileSync(dest, result.code, 'utf8');
    $fs.writeFileSync(sourceMapDest, result.map, 'utf8');
  }
};
