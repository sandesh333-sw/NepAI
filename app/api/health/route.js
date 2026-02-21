import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
//import redis from '@/lib/redis'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  }

  // Check MongoDB
  try {
    await dbConnect()
    health.services.mongodb = 'connected'
  } catch (error) {
    health.status = 'unhealthy'
    health.services.mongodb = 'disconnected'
  }

  // Check Redis
//   try {
//     if (redis) {
//       await redis.ping()
//       health.services.redis = 'connected'
//     } else {
//       health.services.redis = 'not configured'
//     }
//   } catch (error) {
//     health.status = 'degraded'
//     health.services.redis = 'disconnected'
//   }

//   const statusCode = health.status === 'healthy' ? 200 : 503

//   return NextResponse.json(health, { status: statusCode })
}