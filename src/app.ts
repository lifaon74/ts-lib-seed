import { helloWorld } from './core/hello-world';

export function start(mainCallBack: () => (Promise<any> | any)) {
  const ENVIRONMENT: 'browser' | 'nodejs' = ('window' in globalThis) ? 'browser' : 'nodejs';

  const run = () => {
    return new Promise<void>(resolve => resolve(mainCallBack()))
      .catch((error: any) => {
        switch (ENVIRONMENT) {
          case 'browser':
            process.stdout.write('\x1b[31m');
            console.log(
              `[ERROR]`,
              (typeof error.toJSON === 'function')
                ? error.toJSON()
                : error
            );
            process.stdout.write('\x1b[0m');
            break;
          case 'nodejs':
            console.error(error);
            break;
        }
      });
  };

  switch (ENVIRONMENT) {
    case 'browser':
      window.onload = run;
      break;
    case 'nodejs':
      run();
      break;
  }
}

start(helloWorld);





