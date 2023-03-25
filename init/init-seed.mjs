import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.private.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(normalize(__dirname), '..');
const DEST = join(ROOT, '..', config.libName);

const EXCLUDED_DIRECTORIES = ['.git', '.idea', 'node_modules', 'dist', 'init'];
const EXCLUDED_REPLACE_TAGS_PATH = ['.yarn'];


const tags = Object.entries({
  '{{github-page}}': config.githubPage,
  '{{package-name}}': config.packageName,
  '{{lib-name}}': config.libName,
  '{{author}}': config.author,
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceTagsInContent(buffer) {
  return tags.reduce((previousValue, [key, value]) => {
    return previousValue.replace(new RegExp(escapeRegExp(key), 'g'), value);
  }, buffer.toString());
}

function replaceTagsInFile(path, { dry = false } = {}) {
  const dest = join(DEST, relative(ROOT, path));

  console.log('read', path);
  console.log('write', dest);

  if (dry) {
    return Promise.resolve();
  } else {
    return mkdir(dirname(dest), { recursive: true })
      .then(() => {
        if (EXCLUDED_REPLACE_TAGS_PATH.some(_ => path.includes(_))) {
          return copyFile(path, dest);
        } else {
          return readFile(path)
            .then((buffer) => {
              return writeFile(dest, replaceTagsInContent(buffer));
            });
        }
      });

  }
}

function searchAndReplaceTags(path, options) {
  return readdir(path, { withFileTypes: true })
    .then((entries) => {
      return Promise.all(
        entries.map((entry) => {
          const entryPath = join(path, entry.name);
          if (entry.isFile()) {
            return replaceTagsInFile(entryPath, options);
          } else if (entry.isDirectory()) {
            if (!EXCLUDED_DIRECTORIES.includes(entry.name)) {
              return searchAndReplaceTags(entryPath, options);
            }
          } else {
            console.log(`Unexpected type '${ entryPath }'`);
          }
        }),
      );

    });
}

function make(options) {
  return stat(DEST)
    .then(
      () => {
        throw new Error(`Destination '${ DEST }' already exists`);
      },
      () => {
        return searchAndReplaceTags(ROOT, options);
      },
    );
}

const options = {
  dry: process.argv.includes('--dry'),
};

make(options)
  .catch((error) => {
    console.error(error);
  });


