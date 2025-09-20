import { NextRequest, NextResponse } from 'next/server'
import { createCloudflareClient, createLocalClient } from '@/lib/prisma-cloudflare'

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge'

// 获取合适的 Prisma 客户端
async function getPrismaClient() {
  try {
    // 在 Cloudflare 环境中，环境变量通过 env 参数传递
    // 检查是否在生产环境
    const isProduction = typeof process !== 'undefined' && 
      (process.env.NODE_ENV === 'production' || process.env.CF_PAGES)
    
    if (isProduction) {
      console.log('🌐 检测到 Cloudflare 环境，尝试连接 D1 数据库')
      
      // 在 Cloudflare 环境中，数据库绑定会作为 context 参数传递
      // 这里我们先尝试获取环境变量
      const env = (globalThis as any).env || {}
      
      if (env.DB) {
        console.log('✨ 找到 D1 数据库绑定')
        return await createCloudflareClient(env)
      } else {
        console.log('⚠️ 未找到 D1 数据库绑定，使用本地数据库')
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
export async function GET() {
  try {
    console.log('📋 API调用: GET /api/videos')
    console.log('🌍 环境信息:', {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: process.env.CF_PAGES,
      ENVIRONMENT: process.env.ENVIRONMENT,
      hasGlobalEnv: !!(globalThis as any).env
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
    
    const data = await request.json()
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