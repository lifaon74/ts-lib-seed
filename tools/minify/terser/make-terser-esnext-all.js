const makeTerser = require('./make-terser');

makeTerser('dist/global/routes.esnext.umd.js', {
  compress: {
    inline: false
  },
});
