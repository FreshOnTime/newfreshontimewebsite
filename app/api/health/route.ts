import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/utils/apiResponses';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await connectDB();
    
    return sendSuccess('API is healthy', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return sendSuccess('API is running but database connection failed', {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      error: 'Database connection failed'
    });
  }
}
