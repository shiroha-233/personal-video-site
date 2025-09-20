import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    message: '🎯 API 测试端点正常工作',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: process.env.CF_PAGES,
      ENVIRONMENT: process.env.ENVIRONMENT,
      hasGlobalEnv: typeof globalThis !== 'undefined',
      globalEnvType: typeof (globalThis as any).DB
    },
    runtime: 'edge'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: '✅ POST 请求处理成功',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      message: '❌ POST 请求处理失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}