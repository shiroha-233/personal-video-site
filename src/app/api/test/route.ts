import { NextRequest, NextResponse } from 'next/server'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 在 Cloudflare Pages + Edge Runtime 中，环境变量通过 request 对象传递
    const cloudflareEnv = (request as any).env || (globalThis as any).env
    
    const testInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        CF_PAGES: process.env.CF_PAGES,
        ENVIRONMENT: process.env.ENVIRONMENT,
        hasGlobalEnv: !!(globalThis as any).env,
        hasCloudflareEnv: !!cloudflareEnv,
        hasRequestEnv: !!(request as any).env,
      },
      runtime: 'edge',
      message: '🎯 API 测试端点正常工作'
    }
    
    // 收集数据库绑定信息
    const dbInfo = {
      hasDB: !!(cloudflareEnv?.DB),
      dbType: cloudflareEnv?.DB ? typeof cloudflareEnv.DB : 'undefined',
      envKeys: cloudflareEnv ? Object.keys(cloudflareEnv) : []
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