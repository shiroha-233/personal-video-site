import { NextRequest, NextResponse } from 'next/server'

// 在本地开发中使用 nodejs，在生产环境中使用 edge
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge'

export async function GET(request: NextRequest) {
  try {
    // 在 Cloudflare Pages + Edge Runtime 中，环境变量的访问方式
    const globalEnv = (globalThis as any).env
    
    const testInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        CF_PAGES: process.env.CF_PAGES,
        ENVIRONMENT: process.env.ENVIRONMENT,
        hasGlobalEnv: !!globalEnv,
        globalEnvType: typeof globalEnv,
      },
      runtime: 'edge',
      message: '🎯 API 测试端点正常工作'
    }
    
    // 收集数据库绑定信息
    const dbInfo = {
      hasDB: !!(globalEnv?.DB),
      dbType: globalEnv?.DB ? typeof globalEnv.DB : 'undefined',
      envKeys: globalEnv ? Object.keys(globalEnv).slice(0, 10) : [],
      totalEnvKeys: globalEnv ? Object.keys(globalEnv).length : 0
    }

    console.log('🧪 测试端点调用:', testInfo)
    console.log('🗄️ 数据库信息:', dbInfo)

    return NextResponse.json({
      success: true,
      data: testInfo,
      database: dbInfo
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