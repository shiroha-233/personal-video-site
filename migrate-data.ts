import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始数据迁移...')

  // 读取JSON数据
  const dataPath = path.join(process.cwd(), 'src', 'data', 'videos.json')
  if (!fs.existsSync(dataPath)) {
    console.log('❌ 找不到 videos.json 文件')
    return
  }

  const videosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`📹 发现 ${videosData.length} 个视频`)

  // 清空现有数据
  console.log('🧹 清理现有数据...')
  await prisma.videoTag.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.video.deleteMany()
  await prisma.tag.deleteMany()

  for (const videoData of videosData) {
    console.log(`📝 导入视频: ${videoData.title}`)

    // 创建视频记录
    const video = await prisma.video.create({
      data: {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        coverImage: videoData.coverImage,
        videoUrl: videoData.videoUrl,
        duration: videoData.duration,
        publishDate: new Date(videoData.publishDate + 'T00:00:00.000Z')
      }
    })

    // 创建资源记录
    for (const resourceData of videoData.resources) {
      await prisma.resource.create({
        data: {
          name: resourceData.name,
          type: resourceData.type,
          url: resourceData.url,
          password: resourceData.password,
          description: resourceData.description,
          videoId: video.id
        }
      })
    }

    // 创建标签记录和关联
    for (const tagName of videoData.tags) {
      // 创建或获取标签
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      })

      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        })
      }

      // 创建视频-标签关联
      await prisma.videoTag.create({
        data: {
          videoId: video.id,
          tagId: tag.id
        }
      })
    }
  }

  console.log('✅ 数据迁移完成!')
  
  // 显示统计信息
  const videoCount = await prisma.video.count()
  const resourceCount = await prisma.resource.count()
  const tagCount = await prisma.tag.count()
  
  console.log(`📊 统计信息:`)
  console.log(`   视频: ${videoCount} 个`)
  console.log(`   资源: ${resourceCount} 个`)
  console.log(`   标签: ${tagCount} 个`)
}

main()
  .catch((e) => {
    console.error('❌ 迁移失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })