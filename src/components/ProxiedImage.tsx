'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProxiedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
}

export default function ProxiedImage({ 
  src, 
  alt, 
  fill, 
  width, 
  height, 
  className, 
  onLoad, 
  onError,
  priority = false
}: ProxiedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [attempt, setAttempt] = useState(0)
  const [hasError, setHasError] = useState(false)

  // 备用代理服务列表 - 基于测试结果优化顺序
  const getProxyUrl = (originalUrl: string, attemptNum: number) => {
    const encodedUrl = encodeURIComponent(originalUrl)
    
    switch (attemptNum) {
      case 0:
        // 优先使用成功的公共代理服务
        return `https://images.weserv.nl/?url=${encodedUrl}`
      case 1:
        // 备用：我们的代理 API
        return `/api/proxy-image?url=${encodedUrl}`
      case 2:
        // 备用：另一个公共代理
        return `https://cors-anywhere.herokuapp.com/${originalUrl}`
      default:
        // 最后尝试原始 URL
        return originalUrl
    }
  }

  const needsProxy = (url: string) => {
    try {
      const urlObj = new URL(url)
      return [
        'hdslb.com',
        'i0.hdslb.com', 
        'i1.hdslb.com',
        'i2.hdslb.com',
        'bilibili.com',
        'img.youtube.com'
      ].some(domain => urlObj.hostname.includes(domain))
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (needsProxy(src)) {
      setCurrentSrc(getProxyUrl(src, attempt))
    } else {
      setCurrentSrc(src)
    }
  }, [src, attempt])

  const handleError = () => {
    console.log(`图片加载失败 (尝试 ${attempt + 1}):`, currentSrc)
    
    if (attempt < 3 && needsProxy(src)) {
      setAttempt(prev => prev + 1)
    } else {
      setHasError(true)
      onError?.()
    }
  }

  const handleLoad = () => {
    console.log(`图片加载成功 (尝试 ${attempt + 1}):`, currentSrc)
    setHasError(false)
    onLoad?.()
  }

  if (hasError) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <p className="text-xs sm:text-sm opacity-75">图片加载失败</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      unoptimized={currentSrc !== src} // 对代理图片禁用优化
    />
  )
}