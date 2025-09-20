import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({
      error: '请提供 url 参数',
      example: '/api/test-image?url=https://example.com/image.jpg'
    }, { status: 400 })
  }

  try {
    // 测试图片URL的可访问性
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      method: 'HEAD', // 只获取头部信息，不下载完整图片
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*;q=0.8',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const result = {
      url,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      cacheControl: response.headers.get('cache-control'),
      proxyUrl: `/api/proxy-image?url=${encodeURIComponent(url)}`,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    return NextResponse.json({
      url,
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      proxyUrl: `/api/proxy-image?url=${encodeURIComponent(url)}`,
      timestamp: new Date().toISOString()
    })
  }
}