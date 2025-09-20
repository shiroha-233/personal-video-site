import { promises as fs } from 'fs'
import path from 'path'
import { Video } from '@/types/video'

const dataFilePath = path.join(process.cwd(), 'public', 'videos.json')

// 确保数据文件存在
async function ensureDataFile() {
  try {
    await fs.access(dataFilePath)
  } catch (error) {
    // 文件不存在，创建默认数据
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
    
    await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf8')
  }
}

// 读取所有视频数据
export async function getAllVideos(): Promise<Video[]> {
  try {
    await ensureDataFile()
    const fileContents = await fs.readFile(dataFilePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('读取视频数据失败:', error)
    return []
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

// 创建新视频
export async function createVideo(videoData: Omit<Video, 'id' | 'publishDate'>): Promise<string> {
  try {
    const videos = await getAllVideos()
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      ...videoData,
      publishDate: new Date().toISOString().split('T')[0]
    }
    
    videos.unshift(newVideo) // 添加到开头
    
    await fs.writeFile(dataFilePath, JSON.stringify(videos, null, 2), 'utf8')
    
    return newVideo.id
  } catch (error) {
    console.error('创建视频失败:', error)
    throw error
  }
}

// 更新视频
export async function updateVideo(id: string, videoData: Partial<Omit<Video, 'id' | 'publishDate'>>): Promise<boolean> {
  try {
    const videos = await getAllVideos()
    const videoIndex = videos.findIndex(video => video.id === id)
    
    if (videoIndex === -1) {
      return false
    }
    
    videos[videoIndex] = {
      ...videos[videoIndex],
      ...videoData
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(videos, null, 2), 'utf8')
    
    return true
  } catch (error) {
    console.error('更新视频失败:', error)
    throw error
  }
}

// 删除视频
export async function deleteVideo(id: string): Promise<boolean> {
  try {
    const videos = await getAllVideos()
    const originalLength = videos.length
    const filteredVideos = videos.filter(video => video.id !== id)
    
    if (filteredVideos.length === originalLength) {
      return false // 没有找到要删除的视频
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(filteredVideos, null, 2), 'utf8')
    
    return true
  } catch (error) {
    console.error('删除视频失败:', error)
    throw error
  }
}