import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos, createVideo } from '@/lib/data'

// 添加这个配置来确保API路由正常工作
export const dynamic = 'force-dynamic'

export const runtime = 'edge'

export async function GET() {
  try {
    console.log('📋 API调用: GET /api/videos')
    
    const videos = await getAllVideos()
    
    console.log('✅ 成功获取视频列表:', videos.length, '个视频')
    return NextResponse.json(videos)
    
  } catch (error) {
    console.error('❌ 获取视频列表失败:', error)
    // 更详细的错误信息
    return NextResponse.json(
      { 
        error: '获取视频列表失败', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('📝 API调用: POST /api/videos')
    console.log('📊 请求数据:', data)

    const videoId = await createVideo({
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      videoUrl: data.videoUrl,
      duration: data.duration,
      resources: data.resources || [],
      tags: data.tags || []
    })

    console.log('✅ 视频创建成功:', videoId)
    return NextResponse.json({ success: true, id: videoId })
    
  } catch (error) {
    console.error('❌ 创建视频失败:', error)
    return NextResponse.json(
      { error: '创建视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}