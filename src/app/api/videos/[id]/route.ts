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
  if (typeof process !== 'undefined' && (process.env.CF_PAGES || process.env.ENVIRONMENT === 'production')) {
    try {
      const env = (globalThis as any).env || process.env
      return await createCloudflareClient(env)
    } catch (error) {
      return localPrisma
    }
  }
  return localPrisma
}

// PUT: 更新视频
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`✏️ API调用: PUT /api/videos/${params.id}`)
    
    const data = await request.json()
    const prisma = await getPrismaClient()
    
    // 删除旧的标签关联
    await prisma.videoTag.deleteMany({
      where: { videoId: params.id }
    })
    
    // 删除旧的资源
    await prisma.resource.deleteMany({
      where: { videoId: params.id }
    })
    
    // 更新视频
    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        videoUrl: data.videoUrl,
        duration: data.duration,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
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
      }
    })

    // 处理标签
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
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
        
        await prisma.videoTag.create({
          data: {
            id: `videotag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            videoId: video.id,
            tagId: tag.id
          }
        })
      }
    }

    console.log(`✅ 成功更新视频: ${video.title}`)
    
    return NextResponse.json({ success: true, video }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('❌ 更新视频失败:', error)
    return NextResponse.json(
      { error: '更新视频失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE: 删除视频
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🗑️ API调用: DELETE /api/videos/${params.id}`)
    
    const prisma = await getPrismaClient()
    
    // 删除视频（级联删除会自动处理关联数据）
    await prisma.video.delete({
      where: { id: params.id }
    })

    console.log(`✅ 成功删除视频: ${params.id}`)
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('❌ 删除视频失败:', error)
    return NextResponse.json(
      { error: '删除视频失败', details: error instanceof Error ? error.message : String(error) },
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