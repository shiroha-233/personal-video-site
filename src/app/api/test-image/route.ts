import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testUrl = searchParams.get('url') || 'http://i2.hdslb.com/bfs/archive/3366a0185a48f362a6a5e075552f830d001f3fcb.jpg'
  
  try {
    // 简单测试直接访问
    let directStatus = 0
    let directError = null
    
    try {
      const directResponse = await fetch(testUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/'
        }
      })
      directStatus = directResponse.status
    } catch (error) {
      directError = error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json({
      message: '🔍 简化测试结果',
      testUrl,
      directAccess: {
        status: directStatus,
        error: directError,
        success: directStatus === 200
      },
      proxyUrl: `/api/proxy-image?url=${encodeURIComponent(testUrl)}`,
      timestamp: new Date().toISOString(),
      environment: 'Cloudflare Pages'
    })
    
  } catch (error) {
    return NextResponse.json({
      message: '❌ 测试失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      testUrl,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}