import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import redis from '@/lib/redis'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  }

  // Check MongoDB
  try {
    await dbConnect()
    health.services.mongodb = 'ok'
  } catch {
    health.status = 'unhealthy'
    health.services.mongodb = 'down'
  }

  // Check Redis
  try {
    if (redis) {
      await redis.ping()
      health.services.redis = 'ok'
    } else {
      health.services.redis = 'disabled'
    }
  } catch {
    health.status = 'degraded'
    health.services.redis = 'down'
  }

  return NextResponse.json(health, { 
    status: health.status === 'healthy' ? 200 : 503 
  })
}