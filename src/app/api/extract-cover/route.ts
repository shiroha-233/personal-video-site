import { NextRequest, NextResponse } from 'next/server'

// 支持的视频平台及其封面提取逻辑
interface CoverExtractor {
  pattern: RegExp
  extract: (url: string) => Promise<string>
}

// 确保URL使用HTTPS协议
function ensureHttps(url: string): string {
  if (url.startsWith('//')) {
    return `https:${url}`
  } else if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return url
}

// B站封面提取
const extractBilibiliCover = async (url: string): Promise<string> => {
  try {
    // 从URL中提取视频ID
    const bvMatch = url.match(/BV[\w]+/)
    const avMatch = url.match(/av(\d+)/)
    
    if (bvMatch) {
      const bvid = bvMatch[0]
      // 使用B站API获取视频信息
      const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/'
        }
      })
      
      const data = await response.json()
      if (data.code === 0 && data.data?.pic) {
        return ensureHttps(data.data.pic)
      }
    } else if (avMatch) {
      const aid = avMatch[1]
      const apiUrl = `https://api.bilibili.com/x/web-interface/view?aid=${aid}`
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/'
        }
      })
      
      const data = await response.json()
      if (data.code === 0 && data.data?.pic) {
        return ensureHttps(data.data.pic)
      }
    }
    
    throw new Error('无法提取B站视频ID')
  } catch (error) {
    console.error('B站封面提取失败:', error)
    throw new Error('B站封面提取失败')
  }
}

// YouTube封面提取
const extractYouTubeCover = async (url: string): Promise<string> => {
  try {
    // 从URL中提取视频ID
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (!match) {
      throw new Error('无法提取YouTube视频ID')
    }
    
    const videoId = match[1]
    // YouTube缩略图URL格式
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    // 验证缩略图是否存在
    const response = await fetch(thumbnailUrl, { method: 'HEAD' })
    if (response.ok) {
      return thumbnailUrl
    }
    
    // 如果高清缩略图不存在，使用标准缩略图
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  } catch (error) {
    console.error('YouTube封面提取失败:', error)
    throw new Error('YouTube封面提取失败')
  }
}

// 腾讯视频封面提取
const extractTencentCover = async (url: string): Promise<string> => {
  try {
    // 腾讯视频ID提取
    const match = url.match(/\/([a-zA-Z0-9]+)\.html/)
    if (!match) {
      throw new Error('无法提取腾讯视频ID')
    }
    
    const videoId = match[1]
    // 腾讯视频封面URL格式（可能需要调整）
    return `https://puui.qpic.cn/vcover_hz_pic/0/${videoId}_496_280.jpg`
  } catch (error) {
    console.error('腾讯视频封面提取失败:', error)
    throw new Error('腾讯视频封面提取失败')
  }
}

// 爱奇艺封面提取
const extractIqiyiCover = async (url: string): Promise<string> => {
  try {
    // 爱奇艺视频ID提取
    const match = url.match(/\/([a-zA-Z0-9_]+)\.html/)
    if (!match) {
      throw new Error('无法提取爱奇艺视频ID')
    }
    
    // 爱奇艺的封面提取较为复杂，这里提供一个基础实现
    // 实际使用时可能需要调用爱奇艺的API
    throw new Error('爱奇艺封面提取暂未完全支持')
  } catch (error) {
    console.error('爱奇艺封面提取失败:', error)
    throw new Error('爱奇艺封面提取失败')
  }
}

// 平台配置
const extractors: CoverExtractor[] = [
  {
    pattern: /bilibili\.com|b23\.tv/,
    extract: extractBilibiliCover
  },
  {
    pattern: /youtube\.com|youtu\.be/,
    extract: extractYouTubeCover
  },
  {
    pattern: /v\.qq\.com/,
    extract: extractTencentCover
  },
  {
    pattern: /iqiyi\.com/,
    extract: extractIqiyiCover
  }
]

// 主要的封面提取函数
async function extractVideoCover(videoUrl: string): Promise<string> {
  // 查找匹配的平台
  const extractor = extractors.find(ext => ext.pattern.test(videoUrl))
  
  if (!extractor) {
    throw new Error('不支持的视频平台')
  }
  
  return await extractor.extract(videoUrl)
}

// API路由处理
export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()
    
    if (!videoUrl) {
      return NextResponse.json({ error: '请提供视频URL' }, { status: 400 })
    }
    
    const coverUrl = await extractVideoCover(videoUrl)
    
    return NextResponse.json({ 
      success: true, 
      coverUrl,
      message: '封面提取成功'
    })
  } catch (error) {
    console.error('封面提取失败:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '封面提取失败' 
    }, { status: 500 })
  }
}

// GET方法用于测试
export async function GET() {
  return NextResponse.json({ 
    message: '视频封面提取API',
    supportedPlatforms: [
      'Bilibili (bilibili.com, b23.tv)',
      'YouTube (youtube.com, youtu.be)',
      'Tencent Video (v.qq.com)',
      'iQiyi (iqiyi.com) - 部分支持'
    ]
  })
}