const { runNetlifyBuild } = jest.requireActual('../scripts/netlify-build.cjs');
const env = { NETLIFY: 'true', CONTEXT: 'production', DATABASE_URL: 'postgresql://fixture:fixture@localhost/freshpick_test' };
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

test('production applies committed migrations before building', () => {
  const run = jest.fn().mockReturnValue({ status: 0 });
  expect(runNetlifyBuild(env, run)).toBe(0);
  expect(run.mock.calls.map(call => call[1])).toEqual([['run', 'db:migrate'], ['run', 'build']]);
});
test.each(['deploy-preview', 'branch-deploy', 'dev'])('%s only checks migration status and never mutates a possibly shared database', context => {
  const run = jest.fn().mockReturnValue({ status: 0 });
  expect(runNetlifyBuild({ ...env, CONTEXT: context }, run)).toBe(0);
  expect(run.mock.calls.map(call => call[1])).toEqual([['prisma', 'migrate', 'status'], ['run', 'build']]);
});
test.each([1, 2, null])('failed schema readiness (%s) stops deployment before build', status => {
  const run = jest.fn().mockReturnValue({ status });
  expect(runNetlifyBuild(env, run)).not.toBe(0);
  expect(run).toHaveBeenCalledTimes(1);
});
test('missing credentials/context never runs a migration', () => {
  const run = jest.fn();
  expect(runNetlifyBuild({ NETLIFY: 'true', CONTEXT: 'production' }, run)).toBe(1);
  expect(runNetlifyBuild({ ...env, NETLIFY: 'false' }, run)).toBe(1);
  expect(run).not.toHaveBeenCalled();
});
