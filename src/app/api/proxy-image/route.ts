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

    console.log('🖼️ 代理图片请求:', url)

    // 创建带超时的 fetch 请求
    const controller = new AbortController()
    
    // 使用 Promise.race 实现超时，避免使用 setTimeout
    const fetchPromise = fetch(url, {
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

    const timeoutPromise = new Promise((_, reject) => {
      // 使用 queueMicrotask 替代 setTimeout 以兼容 Edge Runtime
      const startTime = Date.now()
      const checkTimeout = () => {
        if (Date.now() - startTime > 8000) { // 8秒超时
          controller.abort()
          reject(new Error('Request timeout'))
        } else {
          queueMicrotask(checkTimeout)
        }
      }
      queueMicrotask(checkTimeout)
    })

    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // 验证是否为图片类型
    if (!contentType.startsWith('image/')) {
      throw new Error('响应不是图片类型')
    }

    const imageData = await response.arrayBuffer()

    console.log('✅ 图片代理成功:', url, `(${imageData.byteLength} bytes)`)

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24小时缓存
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('❌ 图片代理失败:', error)
    
    // 检查错误类型
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: '请求超时，请稍后重试' },
          { status: 408 }
        )
      }
      
      if (error.message.includes('HTTP 4')) {
        return NextResponse.json(
          { error: '图片不存在或无权访问' },
          { status: 404 }
        )
      }
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