import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  let timeoutId: number | null = null
  
  try {
    if (!url) {
      return NextResponse.json(
        { error: '缺少 url 参数' },
        { status: 400 }
      )
    }

    // 验证 URL 格式
    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: '无效的 URL 格式' },
        { status: 400 }
      )
    }

    // 只允许 HTTP 和 HTTPS 协议
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return NextResponse.json(
        { error: '不支持的协议' },
        { status: 400 }
      )
    }

    // 获取图片
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时，适合 Cloudflare Workers
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': url.includes('bilibili.com') || url.includes('hdslb.com') 
          ? 'https://www.bilibili.com/' 
          : url.includes('youtube.com') 
          ? 'https://www.youtube.com/' 
          : 'https://www.google.com/',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      signal: controller.signal
    })
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    // 验证内容类型
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: '目标 URL 不是图片资源' },
        { status: 400 }
      )
    }

    const imageData = await response.arrayBuffer()

    // 检查图片大小（限制为 10MB）
    if (imageData.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片文件过大' },
        { status: 413 }
      )
    }

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24小时缓存，适合 Cloudflare
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('图片代理失败:', error)
    
    // 清除超时
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // 返回一个简单的占位图片或错误信息
    // 检查是否为超时错误
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError' || error.message.includes('aborted'))) {
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