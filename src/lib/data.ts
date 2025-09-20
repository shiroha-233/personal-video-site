import { Video } from '@/types/video'

// 默认数据
const defaultData: Video[] = [
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

// 检测环境
const isDevelopment = process.env.NODE_ENV === 'development'

// 开发环境：文件系统操作
async function readVideosFromFile(): Promise<Video[]> {
  if (!isDevelopment) return defaultData
  
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'public', 'videos.json')
    
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    return Array.isArray(data) ? data : defaultData
  } catch (error) {
    console.log('📄 开发环境：videos.json 文件不存在，使用默认数据')
    return defaultData
  }
}

async function writeVideosToFile(videos: Video[]): Promise<void> {
  if (!isDevelopment) {
    throw new Error('生产环境不支持写入操作')
  }
  
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'public', 'videos.json')
    
    await fs.writeFile(filePath, JSON.stringify(videos, null, 2), 'utf-8')
    console.log('💾 开发环境：成功写入 videos.json 文件')
  } catch (error) {
    console.error('❌ 开发环境：写入 videos.json 文件失败:', error)
    throw error
  }
}

// 生产环境：内存存储（从静态文件初始化）
let productionMemoryStorage: Video[] | null = null

async function getProductionStorage(): Promise<Video[]> {
  if (productionMemoryStorage === null) {
    try {
      // 在生产环境中，尝试通过 fetch 获取静态文件
      const response = await fetch('/videos.json')
      if (response.ok) {
        const data = await response.json()
        productionMemoryStorage = Array.isArray(data) ? data : defaultData
      } else {
        productionMemoryStorage = defaultData
      }
    } catch (error) {
      console.log('⚠️ 生产环境：无法获取 videos.json，使用默认数据')
      productionMemoryStorage = defaultData
    }
  }
  return [...productionMemoryStorage]
}

// 统一的数据访问接口
export async function getAllVideos(): Promise<Video[]> {
  try {
    console.log(`📋 getAllVideos 被调用 - ${isDevelopment ? '开发' : '生产'}环境`)
    
    if (isDevelopment) {
      const videos = await readVideosFromFile()
      console.log('✅ 开发环境：从文件读取到', videos.length, '个视频')
      return videos
    } else {
      const videos = await getProductionStorage()
      console.log('✅ 生产环境：从内存读取到', videos.length, '个视频')
      return videos
    }
  } catch (error) {
    console.error('❌ 读取视频数据失败:', error)
    return [...defaultData]
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const videos = await getAllVideos()
    return videos.find(video => video.id === id) || null
  } catch (error) {
    console.error('获取视频详情失败:', error)
    return null
  }
}

export async function createVideo(videoData: Omit<Video, 'id' | 'publishDate'>): Promise<string> {
  if (!isDevelopment) {
    throw new Error('生产环境不支持创建操作')
  }
  
  try {
    console.log('➕ 开发环境：createVideo 被调用')
    console.log('📊 新视频数据:', videoData)
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      ...videoData,
      publishDate: new Date().toISOString().split('T')[0]
    }
    
    const existingVideos = await readVideosFromFile()
    const updatedVideos = [newVideo, ...existingVideos]
    
    await writeVideosToFile(updatedVideos)
    
    console.log('✅ 开发环境：视频创建成功，当前总数:', updatedVideos.length)
    return newVideo.id
  } catch (error) {
    console.error('❌ 创建视频失败:', error)
    throw error
  }
}

export async function updateVideo(id: string, videoData: Partial<Omit<Video, 'id' | 'publishDate'>>): Promise<boolean> {
  if (!isDevelopment) {
    throw new Error('生产环境不支持更新操作')
  }
  
  try {
    console.log('🔄 开发环境：updateVideo 被调用, ID:', id)
    console.log('📊 更新数据:', videoData)
    
    const videos = await readVideosFromFile()
    const videoIndex = videos.findIndex(video => video.id === id)
    
    if (videoIndex === -1) {
      console.log('❌ 视频不存在, ID:', id)
      return false
    }
    
    videos[videoIndex] = {
      ...videos[videoIndex],
      ...videoData
    }
    
    await writeVideosToFile(videos)
    
    console.log('✅ 开发环境：视频更新成功')
    return true
  } catch (error) {
    console.error('❌ 更新视频失败:', error)
    throw error
  }
}

export async function deleteVideo(id: string): Promise<boolean> {
  if (!isDevelopment) {
    throw new Error('生产环境不支持删除操作')
  }
  
  try {
    console.log('🗑️ 开发环境：deleteVideo 被调用, ID:', id)
    
    const videos = await readVideosFromFile()
    const originalLength = videos.length
    const filteredVideos = videos.filter(video => video.id !== id)
    
    const deleted = filteredVideos.length < originalLength
    
    if (deleted) {
      await writeVideosToFile(filteredVideos)
      console.log('✅ 开发环境：删除成功，当前总数:', filteredVideos.length)
    } else {
      console.log('❌ 未找到要删除的视频')
    }
    
    return deleted
  } catch (error) {
    console.error('❌ 删除视频失败:', error)
    throw error
  }
}