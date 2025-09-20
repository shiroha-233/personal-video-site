import { Video } from '@/types/video'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const VIDEOS_FILE_PATH = join(process.cwd(), 'public', 'videos.json')

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

// 读取 JSON 文件
async function readVideosFile(): Promise<Video[]> {
  try {
    const fileContent = await readFile(VIDEOS_FILE_PATH, 'utf-8')
    const data = JSON.parse(fileContent)
    return Array.isArray(data) ? data : defaultData
  } catch (error) {
    console.log('📄 videos.json 文件不存在或格式错误，使用默认数据')
    return defaultData
  }
}

// 写入 JSON 文件
async function writeVideosFile(videos: Video[]): Promise<void> {
  try {
    await writeFile(VIDEOS_FILE_PATH, JSON.stringify(videos, null, 2), 'utf-8')
    console.log('💾 成功写入 videos.json 文件')
  } catch (error) {
    console.error('❌ 写入 videos.json 文件失败:', error)
    throw error
  }
}

// 读取所有视频数据
export async function getAllVideos(): Promise<Video[]> {
  try {
    console.log('📋 getAllVideos 被调用 - 从文件读取')
    const videos = await readVideosFile()
    console.log('✅ 从 videos.json 读取到', videos.length, '个视频')
    return videos
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

// 创建新视频 - 保存到文件
export async function createVideo(videoData: Omit<Video, 'id' | 'publishDate'>): Promise<string> {
  try {
    console.log('➕ createVideo 被调用 - 保存到文件')
    console.log('📊 新视频数据:', videoData)
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      ...videoData,
      publishDate: new Date().toISOString().split('T')[0]
    }
    
    console.log('🆕 生成的新视频:', newVideo)
    
    // 读取现有数据
    const existingVideos = await readVideosFile()
    
    // 添加新视频到开头
    const updatedVideos = [newVideo, ...existingVideos]
    
    // 写入文件
    await writeVideosFile(updatedVideos)
    
    console.log('✅ 视频创建成功并保存到文件, 当前总数:', updatedVideos.length)
    return newVideo.id
  } catch (error) {
    console.error('❌ 创建视频失败:', error)
    throw error
  }
}

// 更新视频 - 保存到文件
export async function updateVideo(id: string, videoData: Partial<Omit<Video, 'id' | 'publishDate'>>): Promise<boolean> {
  try {
    console.log('🔄 updateVideo 被调用 - 保存到文件, ID:', id)
    console.log('📊 更新数据:', videoData)
    
    // 读取现有数据
    const videos = await readVideosFile()
    console.log('📋 从文件读取到', videos.length, '个视频')
    
    const videoIndex = videos.findIndex(video => video.id === id)
    console.log('🔍 找到视频索引:', videoIndex)
    
    if (videoIndex === -1) {
      console.log('❌ 视频不存在, ID:', id)
      console.log('📋 现有视频IDs:', videos.map(v => v.id))
      return false
    }
    
    const oldVideo = videos[videoIndex]
    console.log('📝 原视频数据:', oldVideo)
    
    // 更新视频数据
    videos[videoIndex] = {
      ...videos[videoIndex],
      ...videoData
    }
    
    // 写入文件
    await writeVideosFile(videos)
    
    console.log('✅ 视频更新成功并保存到文件:', videos[videoIndex])
    return true
  } catch (error) {
    console.error('❌ 更新视频失败:', error)
    throw error
  }
}

// 删除视频 - 保存到文件
export async function deleteVideo(id: string): Promise<boolean> {
  try {
    console.log('🗑️ deleteVideo 被调用 - 保存到文件, ID:', id)
    
    // 读取现有数据
    const videos = await readVideosFile()
    console.log('📋 从文件读取到', videos.length, '个视频')
    console.log('📋 现有视频IDs:', videos.map(v => v.id))
    
    const originalLength = videos.length
    const filteredVideos = videos.filter(video => video.id !== id)
    
    const deleted = filteredVideos.length < originalLength
    
    if (deleted) {
      // 写入文件
      await writeVideosFile(filteredVideos)
      console.log('📋 删除后视频数量:', filteredVideos.length)
      console.log('✅ 删除成功并保存到文件')
    } else {
      console.log('❌ 未找到要删除的视频')
    }
    
    return deleted
  } catch (error) {
    console.error('❌ 删除视频失败:', error)
    throw error
  }
}