import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: '缺少图片URL参数' }, { status: 400 })
  }

  try {
    // 验证URL是否来自允许的域名
    const allowedHosts = [
      'i1.hdslb.com',
      'i2.hdslb.com', 
      'i0.hdslb.com',
      'img.youtube.com',
      'picsum.photos',
      'images.unsplash.com',
      'via.placeholder.com'
    ]
    
    const urlObj = new URL(imageUrl)
    if (!allowedHosts.some(host => urlObj.hostname.includes(host))) {
      return NextResponse.json({ error: '不支持的图片源' }, { status: 403 })
    }

    // 代理请求图片，设置正确的请求头
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': urlObj.hostname.includes('hdslb.com') ? 'https://www.bilibili.com/' : imageUrl,
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`图片请求失败: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存1天
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    console.error('代理图片失败:', error)
    return NextResponse.json({ error: '获取图片失败' }, { status: 500 })
  }
}