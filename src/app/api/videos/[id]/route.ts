import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const video = await getVideoById(id)

    if (!video) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    return NextResponse.json(video)
    
  } catch (error) {
    console.error('获取视频详情失败:', error)
    return NextResponse.json(
      { error: '获取视频详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    
    const success = await updateVideo(id, {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      videoUrl: data.videoUrl,
      duration: data.duration,
      resources: data.resources || [],
      tags: data.tags || []
    })
    
    if (!success) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('更新视频失败:', error)
    return NextResponse.json(
      { error: '更新视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const success = await deleteVideo(id)
    
    if (!success) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('删除视频失败:', error)
    return NextResponse.json(
      { error: '删除视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}