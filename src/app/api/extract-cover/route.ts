import { NextRequest, NextResponse } from 'next/server'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()
    
    if (!videoUrl) {
      return NextResponse.json({ success: false, error: '缺少视频链接' }, { status: 400 })
    }

    console.log('🎬 尝试提取封面:', videoUrl)
    
    let coverUrl = ''
    
    // B站视频
    if (videoUrl.includes('bilibili.com')) {
      try {
        const bvMatch = videoUrl.match(/\/video\/(BV[a-zA-Z0-9]+)/)
        if (bvMatch) {
          const bvid = bvMatch[1]
          // 使用 B站 API 获取视频信息
          const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
          
          const response = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://www.bilibili.com/'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.code === 0 && data.data && data.data.pic) {
              coverUrl = data.data.pic
              console.log('✅ B站封面提取成功:', coverUrl)
            }
          }
        }
      } catch (error) {
        console.log('❌ B站封面提取失败:', error)
      }
    }
    
    // YouTube 视频
    else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      try {
        let videoId = ''
        
        if (videoUrl.includes('youtube.com/watch')) {
          const match = videoUrl.match(/[?&]v=([^&]+)/)
          if (match) videoId = match[1]
        } else if (videoUrl.includes('youtu.be/')) {
          const match = videoUrl.match(/youtu\.be\/([^?]+)/)
          if (match) videoId = match[1]
        }
        
        if (videoId) {
          coverUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          console.log('✅ YouTube封面生成成功:', coverUrl)
        }
      } catch (error) {
        console.log('❌ YouTube封面提取失败:', error)
      }
    }
    
    if (coverUrl) {
      return NextResponse.json({ 
        success: true, 
        coverUrl 
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '暂不支持该视频平台的封面提取' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ 封面提取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '封面提取失败' 
    }, { status: 500 })
  }
}

// OPTIONS: 处理预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}