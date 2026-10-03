import { NextResponse } from 'next/server';

/** Missing tables/columns are deployment failures, not empty queues or bad sessions. */
export function adminDataError(error: unknown, message: string) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const schemaOutdated = code === 'P2021' || code === 'P2022';
  console.error('[Admin data]', { code: typeof code === 'string' ? code : 'UNKNOWN', message });
  return NextResponse.json(schemaOutdated ? {
    error: 'This admin feature needs a database update. Apply the latest database migrations, then refresh.',
    code: 'DATABASE_SCHEMA_OUTDATED',
  } : { error: message }, {
    status: schemaOutdated ? 503 : 500,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
