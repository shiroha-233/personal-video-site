'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  onError?: () => void
  onLoad?: () => void
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  onError,
  onLoad
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 处理图片URL，对于需要代理的图片使用代理API
  const getProxiedImageUrl = (originalUrl: string) => {
    try {
      // 如果已经是代理URL，直接返回
      if (originalUrl.startsWith('/api/proxy-image')) {
        return originalUrl
      }
      
      const urlObj = new URL(originalUrl)
      // 对于需要代理的域名，使用代理API
      const needsProxy = [
        'hdslb.com',
        'i0.hdslb.com', 
        'i1.hdslb.com',
        'i2.hdslb.com',
        'bilibili.com',
        'img.youtube.com',
        'ytimg.com'
      ].some(domain => urlObj.hostname.includes(domain))
      
      if (needsProxy) {
        return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
      }
      return originalUrl
    } catch {
      return originalUrl
    }
  }

  const handleError = () => {
    console.log('图片加载失败:', src)
    setImageError(true)
    setIsLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const imageUrl = getProxiedImageUrl(src)

  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <ExternalLink className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
          <p className="text-xs sm:text-sm opacity-75">封面加载失败</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-300 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={imageUrl.startsWith('/api/proxy-image')}
        priority={priority}
      />
    </>
  )
}