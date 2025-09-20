import { prisma } from './src/lib/prisma'
import { writeFile } from 'fs/promises'

async function exportData() {
  try {
    console.log('正在导出数据...')
    
    // 获取所有视频数据
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
    const transformedVideos = videos.map((video) => ({
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

    // 写入静态文件
    await writeFile('public/videos.json', JSON.stringify(transformedVideos, null, 2))
    
    console.log(`✅ 导出完成！共导出 ${transformedVideos.length} 个视频`)
    console.log('数据已保存到 public/videos.json')
    
  } catch (error) {
    console.error('❌ 导出失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()