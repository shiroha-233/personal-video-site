import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/data'

// 移除 Edge Runtime，使用 Node.js Runtime 支持文件系统操作
// export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    console.log('🔄 API PUT 被调用, ID:', id)
    console.log('📋 请求 URL:', request.url)
    console.log('📊 更新数据:', data)
    
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
      console.log('❌ 视频不存在, ID:', id)
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    console.log('✅ 更新成功, ID:', id)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ 更新视频失败:', error)
    return NextResponse.json(
      { error: '更新视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🗑️ API DELETE 被调用, ID:', id)
    console.log('📋 请求 URL:', request.url)
    
    const success = await deleteVideo(id)
    
    if (!success) {
      console.log('❌ 视频不存在, ID:', id)
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    console.log('✅ 删除成功, ID:', id)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ 删除视频失败:', error)
    return NextResponse.json(
      { error: '删除视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}