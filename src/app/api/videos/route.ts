import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma-cloudflare'

export const runtime = 'edge'

export async function GET() {
  try {
    console.log('📋 API调用: GET /api/videos')
    
    // 环境信息
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: process.env.CF_PAGES,
      ENVIRONMENT: process.env.ENVIRONMENT
    }
    console.log('🌍 环境信息:', env)

    // 尝试从数据库获取视频
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

    // 转换数据格式
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      coverImage: video.coverImage,
      videoUrl: video.videoUrl,
      duration: video.duration,
      publishDate: video.publishDate.toISOString().split('T')[0],
      resources: video.resources.map(resource => ({
        name: resource.name,
        type: resource.type,
        url: resource.url,
        password: resource.password,
        description: resource.description
      })),
      tags: video.tags.map(vt => vt.tag.name)
    }))

    console.log('✅ 成功获取视频列表:', formattedVideos.length, '个视频')
    return NextResponse.json(formattedVideos)
    
  } catch (error) {
    console.error('❌ 获取视频列表失败:', error)
    console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'Unknown error')
    
    // 返回后备数据
    const fallbackData = [
      {
        id: "example-1",
        title: "个人视频网站部署教程",
        description: "使用 Next.js + Cloudflare Pages 构建个人视频资源分享网站的完整教程。",
        coverImage: "https://via.placeholder.com/480x270/6366f1/ffffff?text=Video+Tutorial",
        videoUrl: "https://www.bilibili.com/video/BV1234567890",
        duration: "25:30",
        publishDate: "2024-01-20",
        resources: [
          {
            name: "项目源码",
            type: "github",
            url: "https://github.com/shiroha-233/personal-video-site",
            description: "完整的项目源代码"
          }
        ],
        tags: ["Next.js", "Cloudflare", "教程", "部署"]
      }
    ]
    
    return NextResponse.json(fallbackData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('📝 API调用: POST /api/videos')
    console.log('📊 请求数据:', data)

    // 创建新视频
    const video = await prisma.video.create({
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
      },
      include: {
        resources: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    console.log('✅ 视频创建成功:', video.id)
    return NextResponse.json({ success: true, id: video.id })
    
  } catch (error) {
    console.error('❌ 创建视频失败:', error)
    return NextResponse.json(
      { error: '创建视频失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}