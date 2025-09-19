import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - 更新视频
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { id } = await params

    // 删除现有的资源和标签关联
    await prisma.resource.deleteMany({
      where: { videoId: id }
    })
    await prisma.videoTag.deleteMany({
      where: { videoId: id }
    })

    // 更新视频基本信息
    const video = await prisma.video.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        videoUrl: data.videoUrl,
        duration: data.duration
      }
    })

    // 重新创建资源
    if (data.resources && data.resources.length > 0) {
      await prisma.resource.createMany({
        data: data.resources.map((resource: any) => ({
          ...resource,
          videoId: video.id
        }))
      })
    }

    // 重新创建标签关联
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName }
          })
        }

        await prisma.videoTag.create({
          data: {
            videoId: video.id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json({ message: '视频更新成功' })
  } catch (error) {
    console.error('更新视频失败:', error)
    return NextResponse.json({ error: '更新视频失败' }, { status: 500 })
  }
}

// DELETE - 删除视频
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 删除关联数据（Prisma 会自动处理级联删除）
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ message: '视频删除成功' })
  } catch (error) {
    console.error('删除视频失败:', error)
    return NextResponse.json({ error: '删除视频失败' }, { status: 500 })
  }
}