import { NextResponse } from 'next/server';

// Seeding has been disabled
export async function GET() {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
