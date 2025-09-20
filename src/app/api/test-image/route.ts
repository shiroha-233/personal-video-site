import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testUrl = searchParams.get('url') || 'http://i2.hdslb.com/bfs/archive/3366a0185a48f362a6a5e075552f830d001f3fcb.jpg'
  
  try {
    console.log('测试图片代理:', testUrl)
    
    // 测试直接访问
    const directResponse = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    const directStatus = directResponse.status
    const directHeaders = Object.fromEntries(directResponse.headers.entries())
    
    // 测试代理 API
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(testUrl)}`
    const baseUrl = request.url.replace('/api/test-image', '')
    const fullProxyUrl = `${baseUrl}${proxyUrl}`
    
    let proxyStatus = 0
    let proxyError = null
    
    try {
      const proxyResponse = await fetch(fullProxyUrl)
      proxyStatus = proxyResponse.status
    } catch (error) {
      proxyError = error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json({
      message: '🔍 图片代理测试结果',
      testUrl,
      proxyUrl,
      results: {
        direct: {
          status: directStatus,
          headers: directHeaders,
          success: directStatus === 200
        },
        proxy: {
          status: proxyStatus,
          error: proxyError,
          success: proxyStatus === 200
        }
      },
      environment: {
        runtime: 'edge',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      }
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