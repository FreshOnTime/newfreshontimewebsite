/* eslint-disable @typescript-eslint/no-require-imports */
// Bundle the two existing domain-service workers for Node without a TS runtime.
const { build } = require('esbuild');

build({
  entryPoints: ['scripts/jobs/run.ts'],
  outfile: 'dist/jobs/run.cjs',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  packages: 'external',
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
