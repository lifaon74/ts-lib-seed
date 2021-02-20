
export function helloWorld() {
  // INFO: import.meta should be supported when bundling
  // @ts-ignore
  console.log('Hello world', import.meta.url);
}
