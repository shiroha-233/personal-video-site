import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos } from '@/lib/data'

export const runtime = 'edge'

export async function GET() {
  try {
    console.log('🔍 Debug API调用: GET /api/debug')
    
    // 测试获取视频数据
    const videos = await getAllVideos()
    
    console.log('✅ 成功获取视频列表:', videos.length, '个视频')
    
    // 返回详细信息
    return NextResponse.json({
      success: true,
      videoCount: videos.length,
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        coverImage: video.coverImage,
        videoUrl: video.videoUrl,
        publishDate: video.publishDate
      })),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        CF_PAGES: process.env.CF_PAGES,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
      }
    })
    
  } catch (error) {
    console.error('❌ Debug API失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}