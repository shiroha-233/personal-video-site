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

// 在 Edge Runtime 中使用内存存储
let memoryStorage: Video[] = [...defaultData]

// 读取所有视频数据
export async function getAllVideos(): Promise<Video[]> {
  try {
    // 在生产环境中，尝试从 public/videos.json 获取数据
    if (typeof window === 'undefined') {
      // 服务器端，尝试获取静态数据
      try {
        // 在Edge Runtime中，使用相对URL或默认URL
        // 修复：使用正确的相对路径URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
          (process.env.CF_PAGES ? `https://${process.env.CF_PAGES_URL}` : '')
        
        // 构建正确的URL路径
        const urlPath = baseUrl ? `${baseUrl}/videos.json` : '/videos.json'
        
        console.log('🔍 尝试获取视频数据:', urlPath)
        
        const response = await fetch(urlPath, {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ 成功获取静态数据:', Array.isArray(data) ? data.length : 0, '个视频')
          return Array.isArray(data) ? data : defaultData
        } else {
          console.log('⚠️ 静态数据请求失败:', response.status, response.statusText)
        }
      } catch (error) {
        console.log('⚠️ 无法获取静态数据，使用内存数据:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    console.log('🔄 返回内存数据:', memoryStorage.length, '个视频')
    return memoryStorage
  } catch (error) {
    console.error('❌ 读取视频数据失败:', error)
    return [...defaultData]
  }
}

// 根据ID获取单个视频
export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const videos = await getAllVideos()
    return videos.find(video => video.id === id) || null
  } catch (error) {
    console.error('获取视频详情失败:', error)
    return null
  }
}

// 创建新视频 (仅在内存中)
export async function createVideo(videoData: Omit<Video, 'id' | 'publishDate'>): Promise<string> {
  try {
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      ...videoData,
      publishDate: new Date().toISOString().split('T')[0]
    }
    
    memoryStorage = [newVideo, ...memoryStorage]
    
    return newVideo.id
  } catch (error) {
    console.error('创建视频失败:', error)
    throw error
  }
}

// 更新视频 (仅在内存中)
export async function updateVideo(id: string, videoData: Partial<Omit<Video, 'id' | 'publishDate'>>): Promise<boolean> {
  try {
    const videoIndex = memoryStorage.findIndex(video => video.id === id)
    
    if (videoIndex === -1) {
      return false
    }
    
    memoryStorage[videoIndex] = {
      ...memoryStorage[videoIndex],
      ...videoData
    }
    
    return true
  } catch (error) {
    console.error('更新视频失败:', error)
    throw error
  }
}

// 删除视频 (仅在内存中)
export async function deleteVideo(id: string): Promise<boolean> {
  try {
    const originalLength = memoryStorage.length
    memoryStorage = memoryStorage.filter(video => video.id !== id)
    
    return memoryStorage.length < originalLength
  } catch (error) {
    console.error('删除视频失败:', error)
    throw error
  }
}