import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// 支持的视频平台配置
const PLATFORMS = {
  bilibili: {
    patterns: [/bilibili\.com\/video\/([^/?]+)/],
    extractCover: async (url: string) => {
      const match = url.match(/bilibili\.com\/video\/([^/?]+)/)
      if (!match) return null
      
      const bvid = match[1]
      try {
        // 使用Bilibili API获取视频信息
        const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (!response.ok) throw new Error('API请求失败')
        
        const data = await response.json()
        if (data.code !== 0) throw new Error('视频信息获取失败')
        
        return {
          title: data.data.title,
          cover: data.data.pic,
          duration: formatDuration(data.data.duration),
          description: data.data.desc
        }
      } catch (error) {
        console.error('Bilibili API错误:', error)
        return null
      }
    }
  },
  youtube: {
    patterns: [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/],
    extractCover: async (url: string) => {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
      if (!match) return null
      
      const videoId = match[1]
      // YouTube缩略图URL格式
      return {
        title: null, // YouTube需要API key获取详细信息
        cover: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: null,
        description: null
      }
    }
  }
}

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 下载并保存图片
async function downloadAndSaveImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    if (!response.ok) throw new Error('图片下载失败')
    
    const buffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    // 确保covers目录存在
    const coversDir = path.join(process.cwd(), 'public', 'covers')
    try {
      await fs.access(coversDir)
    } catch {
      await fs.mkdir(coversDir, { recursive: true })
    }
    
    // 保存图片
    const filepath = path.join(coversDir, filename)
    await fs.writeFile(filepath, uint8Array)
    
    return `/covers/${filename}`
  } catch (error) {
    console.error('图片保存失败:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()
    
    if (!videoUrl) {
      return NextResponse.json({ error: '请提供视频链接' }, { status: 400 })
    }
    
    console.log('🎬 提取视频信息:', videoUrl)
    
    // 识别平台并提取信息
    let videoInfo = null
    let platform = ''
    
    for (const [platformName, config] of Object.entries(PLATFORMS)) {
      const isMatch = config.patterns.some(pattern => pattern.test(videoUrl))
      if (isMatch) {
        platform = platformName
        videoInfo = await config.extractCover(videoUrl)
        break
      }
    }
    
    if (!videoInfo) {
      return NextResponse.json({ 
        error: '不支持的视频平台或链接格式错误',
        supportedPlatforms: ['bilibili.com', 'youtube.com', 'youtu.be']
      }, { status: 400 })
    }
    
    let localCoverPath = null
    
    // 如果获取到封面，尝试下载保存
    if (videoInfo.cover) {
      try {
        const timestamp = Date.now()
        const filename = `cover_${timestamp}.jpg`
        localCoverPath = await downloadAndSaveImage(videoInfo.cover, filename)
        console.log('✅ 封面下载成功:', localCoverPath)
      } catch (error) {
        console.warn('⚠️ 封面下载失败，使用原始链接:', error)
        localCoverPath = videoInfo.cover // 回退到原始链接
      }
    }
    
    const result = {
      success: true,
      platform,
      data: {
        title: videoInfo.title,
        coverImage: localCoverPath,
        originalCover: videoInfo.cover,
        duration: videoInfo.duration,
        description: videoInfo.description
      }
    }
    
    console.log('🎯 提取完成:', result)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 封面提取失败:', error)
    return NextResponse.json(
      { error: '封面提取失败: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}