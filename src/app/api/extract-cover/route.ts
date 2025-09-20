import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface VideoInfo {
  title?: string
  coverUrl?: string
  duration?: string
}

// 支持的视频平台
const VIDEO_PLATFORMS = {
  BILIBILI: 'bilibili',
  YOUTUBE: 'youtube',
  DOUYIN: 'douyin',
  XIGUA: 'xigua'
}

// 提取B站视频信息
async function extractBilibiliInfo(url: string): Promise<VideoInfo> {
  try {
    // 从URL中提取BV号或av号
    const bvMatch = url.match(/BV[a-zA-Z0-9]+/)
    const avMatch = url.match(/av(\d+)/)
    
    if (!bvMatch && !avMatch) {
      throw new Error('无法从URL中提取视频ID')
    }
    
    // 构建API请求URL
    let apiUrl = ''
    if (bvMatch) {
      apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvMatch[0]}`
    } else if (avMatch) {
      apiUrl = `https://api.bilibili.com/x/web-interface/view?aid=${avMatch[1]}`
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    if (!response.ok) {
      throw new Error('B站API请求失败')
    }
    
    const data = await response.json()
    
    if (data.code !== 0) {
      throw new Error(data.message || 'B站API返回错误')
    }
    
    const videoData = data.data
    
    // 格式化时长
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      }
    }
    
    return {
      title: videoData.title,
      coverUrl: videoData.pic,
      duration: formatDuration(videoData.duration)
    }
  } catch (error) {
    console.error('提取B站视频信息失败:', error)
    throw error
  }
}

// 提取YouTube视频信息
async function extractYouTubeInfo(url: string): Promise<VideoInfo> {
  try {
    // 从URL中提取视频ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    
    if (!videoIdMatch) {
      throw new Error('无法从YouTube URL中提取视频ID')
    }
    
    const videoId = videoIdMatch[1]
    
    // YouTube缩略图URL模式
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    // 尝试获取视频标题（通过oEmbed API）
    try {
      const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json()
        return {
          title: oembedData.title,
          coverUrl: thumbnailUrl
        }
      }
    } catch (error) {
      console.warn('无法获取YouTube视频标题:', error)
    }
    
    return {
      coverUrl: thumbnailUrl
    }
  } catch (error) {
    console.error('提取YouTube视频信息失败:', error)
    throw error
  }
}

// 检测视频平台类型
function detectPlatform(url: string): string {
  if (url.includes('bilibili.com')) {
    return VIDEO_PLATFORMS.BILIBILI
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return VIDEO_PLATFORMS.YOUTUBE
  } else if (url.includes('douyin.com')) {
    return VIDEO_PLATFORMS.DOUYIN
  } else if (url.includes('ixigua.com')) {
    return VIDEO_PLATFORMS.XIGUA
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: '请提供视频URL' },
        { status: 400 }
      )
    }
    
    const platform = detectPlatform(url)
    let videoInfo: VideoInfo = {}
    
    switch (platform) {
      case VIDEO_PLATFORMS.BILIBILI:
        videoInfo = await extractBilibiliInfo(url)
        break
      case VIDEO_PLATFORMS.YOUTUBE:
        videoInfo = await extractYouTubeInfo(url)
        break
      default:
        return NextResponse.json(
          { error: '暂不支持该视频平台' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      platform,
      ...videoInfo
    })
    
  } catch (error) {
    console.error('提取视频信息失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '提取视频信息失败' },
      { status: 500 }
    )
  }
}