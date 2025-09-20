import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma-cloudflare'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        resources: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    const formattedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      coverImage: video.coverImage,
      videoUrl: video.videoUrl,
      duration: video.duration,
      publishDate: video.publishDate.toISOString().split('T')[0],
      resources: video.resources,
      tags: video.tags.map((vt: any) => vt.tag.name)
    }

    return NextResponse.json(formattedVideo)
    
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
    
    // 删除现有的资源和标签关联
    await prisma.resource.deleteMany({
      where: { videoId: id }
    })
    
    await prisma.videoTag.deleteMany({
      where: { videoId: id }
    })

    // 更新视频
    const video = await prisma.video.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        videoUrl: data.videoUrl,
        duration: data.duration,
        resources: {
          create: data.resources?.map((resource: any) => ({
            name: resource.name,
            type: resource.type,
            url: resource.url,
            password: resource.password,
            description: resource.description
          })) || []
        },
        tags: {
          create: data.tags?.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          })) || []
        }
      }
    })

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
    
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('删除视频失败:', error)
    return NextResponse.json(
      { error: '删除视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}