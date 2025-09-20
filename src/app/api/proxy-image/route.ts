import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  try {
    if (!url) {
      return NextResponse.json(
        { error: '缺少 url 参数' },
        { status: 400 }
      )
    }

    // 获取图片
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('bilibili.com') || url.includes('hdslb.com') 
          ? 'https://www.bilibili.com/' 
          : url.includes('youtube.com') 
          ? 'https://www.youtube.com/' 
          : 'https://www.google.com/',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageData = await response.arrayBuffer()

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('图片代理失败:', error)
    
    // 返回一个简单的占位图片或错误信息
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { 
        error: '图片代理失败', 
        details: error instanceof Error ? error.message : 'Unknown error',
        requestedUrl: url
      },
      { status: 500 }
    )
  }
}