import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// 本地开发用的 Prisma 客户端
const localPrisma = new PrismaClient()

// 创建 Cloudflare D1 客户端
async function createCloudflareClient(env: any) {
  const adapter = new PrismaD1(env.DB)
  const prisma = new PrismaClient({ adapter })
  return prisma
}

// 获取合适的 Prisma 客户端
async function getPrismaClient() {
  // 检查是否在 Cloudflare 环境中
  if (typeof process !== 'undefined' && (process.env.CF_PAGES || process.env.ENVIRONMENT === 'production')) {
    try {
      const env = (globalThis as any).env || process.env
      console.log('🌐 使用 Cloudflare D1 数据库')
      return await createCloudflareClient(env)
    } catch (error) {
      console.log('⚠️ D1 连接失败，回退到本地数据库:', error)
      return localPrisma
    }
  }
  
  console.log('🏠 使用本地 SQLite 数据库')
  return localPrisma
}

// GET: 获取所有视频
export async function GET() {
  try {
    console.log('📋 API调用: GET /api/videos')
    
    const prisma = await getPrismaClient()
    
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
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      resources: video.resources.map(resource => ({
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
    return NextResponse.json(
      { error: '获取视频列表失败', details: error instanceof Error ? error.message : String(error) },
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