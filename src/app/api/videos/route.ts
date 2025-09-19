import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Video as PrismaVideo, Resource, VideoTag, Tag } from '@prisma/client'

// 定义包含关联数据的 Prisma 类型
type VideoWithIncludes = PrismaVideo & {
  resources: Resource[];
  tags: (VideoTag & {
    tag: Tag;
  })[];
};

// GET - 获取所有视频
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        resources: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
    })

    const transformedVideos = videos.map((video: VideoWithIncludes) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      coverImage: video.coverImage,
      videoUrl: video.videoUrl,
      duration: video.duration,
      publishDate: video.publishDate.toISOString().split('T')[0],
      resources: video.resources.map((resource) => ({
        name: resource.name,
        type: resource.type,
        url: resource.url,
        password: resource.password,
        description: resource.description
      })),
      tags: video.tags.map((vt) => vt.tag.name)
    }))

    return NextResponse.json(transformedVideos)
  } catch (error) {
    console.error('获取视频失败:', error)
    return NextResponse.json({ error: '获取视频失败' }, { status: 500 })
  }
}

// POST - 创建新视频
export async function POST(request: NextRequest) {
  try {
    const data: {
      title: string;
      description: string;
      coverImage?: string;
      videoUrl?: string;
      duration?: string;
      resources?: Array<{
        name: string;
        type: string;
        url: string;
        password?: string;
        description?: string;
      }>;
      tags?: string[];
    } = await request.json()
    
    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage || '/covers/default.svg',
        videoUrl: data.videoUrl,
        duration: data.duration,
        publishDate: new Date()
      }
    })

    // 创建资源
    if (data.resources && data.resources.length > 0) {
      await prisma.resource.createMany({
        data: data.resources.map((resource) => ({
          ...resource,
          videoId: video.id
        }))
      })
    }

    // 创建标签关联
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

    return NextResponse.json({ message: '视频创建成功', id: video.id })
  } catch (error) {
    console.error('创建视频失败:', error)
    return NextResponse.json({ error: '创建视频失败' }, { status: 500 })
  }
}