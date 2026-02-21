import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  }

  try {
    await dbConnect()
    health.services.mongodb = 'connected'
  } catch (error) {
    health.status = 'unhealthy'
    health.services.mongodb = 'disconnected'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503
  return NextResponse.json(health, { status: statusCode }) 
}