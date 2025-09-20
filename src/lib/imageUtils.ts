/**
 * 图片处理工具函数
 */

// 需要代理的域名列表
const PROXY_DOMAINS = [
  'hdslb.com',
  'i0.hdslb.com', 
  'i1.hdslb.com',
  'i2.hdslb.com',
  'bilibili.com',
  'img.youtube.com',
  'ytimg.com',
  'yt3.ggpht.com'
]

/**
 * 检查URL是否需要代理
 */
export function needsProxy(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return PROXY_DOMAINS.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * 获取代理后的图片URL
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) {
    return '/covers/default.svg'
  }

  try {
    // 验证URL格式
    new URL(originalUrl)
    
    if (needsProxy(originalUrl)) {
      return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
    }
    
    return originalUrl
  } catch {
    // URL格式无效，返回默认图片
    return '/covers/default.svg'
  }
}

/**
 * 检查URL是否可能是有效的图片URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    
    // 检查是否是视频页面而不是图片
    if (urlObj.hostname.includes('bilibili.com') && urlObj.pathname.includes('/video/')) {
      return false
    }
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/watch')) {
      return false
    }
    
    // 检查文件扩展名
    const pathname = urlObj.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext))
    
    // 如果有图片扩展名，或者是已知的图片服务域名，则认为是有效的
    if (hasImageExtension) {
      return true
    }
    
    // 检查是否是已知的图片服务域名
    const imageServiceDomains = [
      'hdslb.com',
      'ytimg.com',
      'yt3.ggpht.com',
      'via.placeholder.com',
      'picsum.photos',
      'unsplash.com',
      'githubusercontent.com'
    ]
    
    return imageServiceDomains.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * 生成占位图片的 data URL
 */
export function generatePlaceholderDataUrl(width = 400, height = 225, text = '加载中...'): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 创建模糊占位符
 */
export function createBlurDataURL(): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
}