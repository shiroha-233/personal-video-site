import { NextRequest, NextResponse } from 'next/server'
import { createCloudflareClient, createLocalClient } from '@/lib/prisma-cloudflare'
import { getRequestContext } from '@cloudflare/next-on-pages'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

// 获取合适的 Prisma 客户端
async function getPrismaClient() {
  try {
    // 检查是否在生产环境
    const isProduction = typeof process !== 'undefined' && 
      (process.env.NODE_ENV === 'production' || process.env.CF_PAGES)
    
    if (isProduction) {
      try {
        // 使用 @cloudflare/next-on-pages 推荐的方法获取 Cloudflare 环境
        const { env } = getRequestContext()
        console.log('🌐 成功获取 Cloudflare 环境，使用 D1 数据库')
        console.log('📦 环境绑定:', { hasDB: !!(env as any).DB })
        return await createCloudflareClient(env)
      } catch (contextError) {
        console.log('⚠️ 无法获取 Cloudflare 上下文，回退到本地模式:', contextError)
        return await createLocalClient()
      }
    } else {
      console.log('🏠 本地开发环境，使用 SQLite 数据库')
      return await createLocalClient()
    }
  } catch (error) {
    console.error('⚠️ 获取 Prisma 客户端失败:', error)
    console.log('🔄 回退到本地数据库模式')
    return await createLocalClient()
  }
}

// GET: 获取所有视频
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API调用: GET /api/videos')
    console.log('🌍 环境信息:', {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: process.env.CF_PAGES,
      ENVIRONMENT: process.env.ENVIRONMENT
    })
    
    const prisma = await getPrismaClient()
    console.log('🔗 Prisma 客户端创建成功')
    
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

    console.log(`📀 查询到 ${videos.length} 个视频记录`)

    // 转换数据格式
    const formattedVideos = videos.map((video: any) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      coverImage: video.coverImage,
      videoUrl: video.videoUrl,
      duration: video.duration,
      publishDate: video.publishDate.toISOString().split('T')[0],
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      resources: video.resources.map((resource: any) => ({
        name: resource.name,
        type: resource.type,
        url: resource.url,
        password: resource.password,
        description: resource.description
      })),
      tags: video.tags.map((vt: any) => vt.tag.name)
    }))

    console.log(`✅ 成功返回 ${formattedVideos.length} 个视频`)
    
    return NextResponse.json(formattedVideos, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('❌ 获取视频列表失败:', error)
    console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: '获取视频列表失败', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST: 创建新视频
export async function POST(request: NextRequest) {
  try {
    console.log('➕ API调用: POST /api/videos')
    
    const data: any = await request.json()
    const prisma = await getPrismaClient()
    
    // 创建视频记录
    const video = await prisma.video.create({
      data: {
        id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        videoUrl: data.videoUrl,
        duration: data.duration,
        publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
        resources: {
          create: data.resources?.map((resource: any) => ({
            id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: resource.name,
            type: resource.type,
            url: resource.url,
            password: resource.password,
            description: resource.description
          })) || []
        }
      },
      include: {
        resources: true
      }
    })

    // 处理标签
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        // 查找或创建标签
        let tag = await prisma.tag.findUnique({
          where: { name: tagName }
        })
        
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: tagName
            }
          })
        }
        
        // 创建视频标签关联
        await prisma.videoTag.create({
          data: {
            id: `videotag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            videoId: video.id,
            tagId: tag.id
          }
        })
      }
    }

    console.log(`✅ 成功创建视频: ${video.title}`)
    
    return NextResponse.json({ success: true, video }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('❌ 创建视频失败:', error)
    return NextResponse.json(
      { error: '创建视频失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// OPTIONS: 处理预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}