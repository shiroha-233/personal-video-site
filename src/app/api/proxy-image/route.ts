import { NextRequest, NextResponse } from 'next/server'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

// 允许的域名白名单
const ALLOWED_DOMAINS = [
  'i0.hdslb.com',
  'i1.hdslb.com', 
  'i2.hdslb.com',
  'archive.biliimg.com',
  'img.youtube.com',
  'puui.qpic.cn',
  'via.placeholder.com'
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // 验证域名
    try {
      const url = new URL(imageUrl)
      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        url.hostname === domain || url.hostname.endsWith('.' + domain)
      )
      
      if (!isAllowed) {
        console.log('❌ 不允许的域名:', url.hostname)
        return new NextResponse('Domain not allowed', { status: 403 })
      }
    } catch (error) {
      return new NextResponse('Invalid URL', { status: 400 })
    }

    console.log('🖼️ 代理图片:', imageUrl)
    
    // 获取图片
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      // 设置超时
      signal: AbortSignal.timeout(10000)
    })

    if (!imageResponse.ok) {
      console.log(`❌ 图片获取失败: ${imageResponse.status}`)
      return new NextResponse('Failed to fetch image', { status: imageResponse.status })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    console.log(`✅ 图片代理成功: ${imageUrl}`)
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存24小时
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('❌ 图片代理失败:', error)
    return new NextResponse('Proxy failed', { status: 500 })
  }
}

// OPTIONS: 处理预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}