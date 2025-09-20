import { NextResponse } from 'next/server'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

export async function GET() {
  try {
    const testInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        CF_PAGES: process.env.CF_PAGES,
        ENVIRONMENT: process.env.ENVIRONMENT,
        hasGlobalEnv: !!(globalThis as any).env,
        hasGlobalDB: !!((globalThis as any).env?.DB),
      },
      runtime: 'edge',
      message: '🎯 API 测试端点正常工作'
    }

    console.log('🧪 测试端点调用:', testInfo)

    return NextResponse.json({
      success: true,
      data: testInfo
    })
  } catch (error) {
    console.error('❌ 测试端点错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}