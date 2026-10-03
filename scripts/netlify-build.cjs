// eslint-disable-next-line @typescript-eslint/no-require-imports -- Netlify invokes this CommonJS CLI directly.
const { spawnSync } = require('node:child_process');

function runNetlifyBuild(env = process.env, run = spawnSync) {
  if (env.NETLIFY !== 'true' || !env.CONTEXT) {
    console.error('This command is for Netlify deployments. Use npm run build locally.');
    return 1;
  }
  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL must be available in the Netlify build scope as well as the function scope.');
    return 1;
  }
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  // Only the published production context may apply committed migrations.
  // Previews verify readiness without changing a possibly shared database.
  const commands = env.CONTEXT === 'production'
    ? [[npm, ['run', 'db:migrate']]]
    : [[npx, ['prisma', 'migrate', 'status']]];
  commands.push([npm, ['run', 'build']]);
  for (const [command, args] of commands) {
    const result = run(command, args, { env, stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.error('Deployment stopped: database readiness or application build failed.');
      return result.status || 1;
    }
  }
  return 0;
}

module.exports = { runNetlifyBuild };
if (require.main === module) process.exitCode = runNetlifyBuild();
