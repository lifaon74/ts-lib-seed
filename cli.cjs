const $path = require('path');
const $fs = require('fs/promises');
const { spawn } = require('child_process');

const ROOT_PATH = $path.join(__dirname, './');
const NODE_MODULES_PATH = $path.join(ROOT_PATH, 'node_modules');

function readPackageJSON(
  directoryPath,
) {
  return $fs.readFile($path.join(directoryPath, 'package.json'), { encoding: 'utf8' })
    .then((content) => {
      return JSON.parse(content);
    });
}

function writePackageJSON(
  directoryPath,
  content,
) {
  return $fs.writeFile($path.join(directoryPath, 'package.json'), JSON.stringify(content, null, 2), { encoding: 'utf8' });
}

function span$(
  file,
  args,
  rejectOnStdError = true,
) {
  return new Promise((
    resolve,
    reject,
  ) => {
    console.log(`\x1b[32m${file}\x1b[33m ${args.join(' ')}\x1b[0m`);
    const cmd = spawn(file, args);

    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);

    if (rejectOnStdError) {
      cmd.stderr.on('data', (data) => {
        reject(new Error(data));
      });
    }

    cmd.on('error', reject);

    cmd.on('close', resolve);
  });
}

async function link(
  packageName,
  {
    forceUpdate = false,
    addToLinkedDependencies = true
  } = {}
) {
  const localPath = ROOT_PATH;
  const localPackageJSON = await readPackageJSON(localPath);

  const linkedDependencies = new Set(localPackageJSON.linkedDependencies ?? []);

  if (!linkedDependencies.has(packageName) || forceUpdate) {
    const packagePath = $path.join(NODE_MODULES_PATH, packageName);

    await span$('yarn', ['link', packageName]);

    const realPath = await $fs.realpath(packagePath);

    await span$('rm', [packagePath]);
    await span$('cp', ['--recursive', '--dereference', realPath, packagePath]);


    const packageJSON = await readPackageJSON(packagePath);

    if (addToLinkedDependencies) {
      linkedDependencies.add(packageName);
    }

    const newLocalPackageJSON = {
      ...localPackageJSON,
      // dependencies: {
      //   ...localPackageJSON.dependencies,
      //   [packageName]: packageJSON.version,
      // },
      linkedDependencies: [
        ...linkedDependencies,
      ],
    };


    const dependencies = Object.entries(packageJSON.dependencies);

    if (dependencies.length > 0) {
      const uuid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
      const tmpNodeModulePath = $path.join($path.dirname(NODE_MODULES_PATH), `_node_modules_${uuid}`)
      await span$('mv', [NODE_MODULES_PATH, tmpNodeModulePath]);

      // const realLocalDependencies = Object.fromEntries(
      //   Object.entries(localPackageJSON.dependencies)
      //     .filter(([name, version]) => {
      //       return !linkedDependencies.has(name);
      //     })
      // );

      const realLocalPackageJSON = {
        ...localPackageJSON,
        dependencies: {},
      };

      await writePackageJSON(localPath, realLocalPackageJSON);

      for (let i = 0; i < dependencies.length; i++) {
        const [name, version] = dependencies[i];
        if (!linkedDependencies.has(name)) {
          try {
            await link(name, {
              forceUpdate: false,
              addToLinkedDependencies: false,
            });
          } catch {
            await span$('yarn', ['add', `${name}@${version}`]);
          }
        }
      }

      await span$('cp', ['--recursive', '--dereference', tmpNodeModulePath + '/.', NODE_MODULES_PATH]);
      await span$('rm', ['-rf', tmpNodeModulePath]);
    }

    await writePackageJSON(localPath, newLocalPackageJSON);
  }
}

async function unlink(
  packageName,
  forceUpdate = false,
) {
  const localPath = ROOT_PATH;
  const localPackageJSON = await readPackageJSON(localPath);

  const linkedDependencies = new Set(localPackageJSON.linkedDependencies ?? []);

  if (linkedDependencies.has(packageName) || forceUpdate) {
    const packagePath = $path.join(NODE_MODULES_PATH, packageName);
    await span$('rm', [packagePath]);

    linkedDependencies.delete(packageName);

    // delete localPackageJSON.dependencies[packageName];

    const newLocalPackageJSON = {
      ...localPackageJSON,
      linkedDependencies: [
        ...linkedDependencies,
      ],
    };

    await writePackageJSON(localPath, newLocalPackageJSON);
  }
}


async function update() {
  const localPath = ROOT_PATH;
  const localPackageJSON = await readPackageJSON(localPath);

  const linkedDependencies = Array.from(new Set(localPackageJSON.linkedDependencies ?? []));

  for (let i = 0; i < linkedDependencies.length; i++) {
    if (i > 0) {
      console.log(' ');
    }
    await link(linkedDependencies[i], {
      forceUpdate: true,
      addToLinkedDependencies: true,
    });
  }
}


async function run() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === 'link') {
    await link(args[1], {
      forceUpdate: args.includes('--force'),
      addToLinkedDependencies: !args.includes('--no-save'),
    });
  } else if (cmd === 'unlink') {
    await unlink(args[1], args[2] === '--force');
  } else if (cmd === 'update') {
    await update();
  } else {
    throw new Error(`Invalid command: ${cmd}`);
  }
}


run();
