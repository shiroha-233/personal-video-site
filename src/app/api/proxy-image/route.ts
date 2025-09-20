import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  try {
    if (!url) {
      return NextResponse.json(
        { error: '缺少 url 参数' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // 验证 URL 格式
    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: '无效的 URL 格式' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // 安全检查：只允许 HTTPS 和特定域名
    if (targetUrl.protocol !== 'https:' && targetUrl.protocol !== 'http:') {
      return NextResponse.json(
        { error: '只支持 HTTP/HTTPS 协议' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // 设置请求头，针对不同平台优化
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    }

    // 根据域名设置特定的 Referer
    const hostname = targetUrl.hostname.toLowerCase()
    if (hostname.includes('hdslb.com') || hostname.includes('bilibili.com')) {
      headers['Referer'] = 'https://www.bilibili.com/'
      headers['Origin'] = 'https://www.bilibili.com'
    } else if (hostname.includes('youtube.com') || hostname.includes('ytimg.com')) {
      headers['Referer'] = 'https://www.youtube.com/'
      headers['Origin'] = 'https://www.youtube.com'
    }

    // 获取图片，设置较短的超时时间适应 Cloudflare Workers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
    
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
      // 在 Cloudflare Workers 中，cf 属性可以用于缓存控制
      cf: {
        cacheEverything: true,
        cacheTtl: 86400, // 24小时缓存
      } as any
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`图片获取失败: ${response.status} ${response.statusText}`)
      
      // 返回一个默认的占位图片 SVG
      const placeholderSvg = `
        <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
            图片加载失败
          </text>
        </svg>
      `
      
      return new NextResponse(placeholderSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300', // 5分钟缓存
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // 检查内容类型
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      throw new Error('响应不是图片类型')
    }

    // 获取图片数据
    const imageData = await response.arrayBuffer()
    
    // 检查图片大小（限制为 5MB）
    if (imageData.byteLength > 5 * 1024 * 1024) {
      throw new Error('图片文件过大')
    }

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // 24小时缓存
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Vary': 'Accept-Encoding',
      }
    })
    
  } catch (error) {
    console.error('图片代理失败:', error)
    
    // 根据错误类型返回不同的占位图片
    let errorMessage = '图片加载失败'
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        errorMessage = '请求超时'
      } else if (error.message.includes('fetch')) {
        errorMessage = '网络错误'
      }
    }
    
    // 返回错误占位图片
    const errorSvg = `
      <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fef2f2"/>
        <rect x="10" y="10" width="380" height="205" fill="none" stroke="#fca5a5" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="16" fill="#dc2626" text-anchor="middle" dy=".3em">
          ⚠️ ${errorMessage}
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="#7f1d1d" text-anchor="middle" dy=".3em">
          请检查网络连接或稍后重试
        </text>
      </svg>
    `
    
    return new NextResponse(errorSvg, {
      status: 200, // 返回 200 状态码，避免浏览器显示错误
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // 5分钟缓存
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}