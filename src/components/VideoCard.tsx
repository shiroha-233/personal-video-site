'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Calendar, Tag, ExternalLink } from 'lucide-react'
import { Video } from '@/types/video'
import VideoDetailModal from './VideoDetailModal'

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  // 检查URL是否可能是图片
  const isValidImageUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      // 检查是否是已知的图片域名和路径
      if (urlObj.hostname.includes('bilibili.com') && urlObj.pathname.includes('/video/')) {
        return false // 这是视频页面，不是图片
      }
      // 可以添加更多验证逻辑
      return true
    } catch {
      return false
    }
  }

  // 处理图片URL，对于需要代理的图片使用代理API
  const getProxiedImageUrl = (originalUrl: string, useProxy: boolean = true) => {
    try {
      const urlObj = new URL(originalUrl)
      // 对于需要代理的域名，使用代理API
      const needsProxy = [
        'hdslb.com',
        'i0.hdslb.com', 
        'i1.hdslb.com',
        'i2.hdslb.com',
        'bilibili.com',
        'img.youtube.com'
      ].some(domain => urlObj.hostname.includes(domain))
      
      if (needsProxy && useProxy) {
        return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`
      }
      return originalUrl
    } catch {
      return originalUrl
    }
  }

  // 处理图片加载错误，尝试降级策略
  const handleImageError = () => {
    console.log('图片加载失败:', video.coverImage)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    if (img.naturalWidth === 0) {
      handleImageError()
    } else {
      setImageLoading(false)
    }
  }

  const shouldShowImage = !imageError && isValidImageUrl(video.coverImage)
  const imageUrl = getProxiedImageUrl(video.coverImage)

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Video Cover */}
        <div className="relative overflow-hidden rounded-t-xl aspect-video">
          {shouldShowImage ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <p className="text-xs sm:text-sm">加载中...</p>
                  </div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={video.title}
                fill
                className={`object-cover group-hover:scale-110 transition-all duration-500 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                priority={false}
                unoptimized={imageUrl.startsWith('/api/proxy-image')}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center">
                <ExternalLink className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm opacity-75">视频封面</p>
              </div>
            </div>
          )}
          
          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/70 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm flex items-center space-x-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{video.duration}</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="bg-white/90 dark:bg-slate-800/90 rounded-full p-2 sm:p-3 backdrop-blur-sm"
            >
              <ExternalLink className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </motion.div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
            {video.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{formatDate(video.publishDate)}</span>
              <span className="sm:hidden">{new Date(video.publishDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span>{video.resources.length} 个资源</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
              >
                <Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                <span className="truncate max-w-16 sm:max-w-none">{tag}</span>
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <VideoDetailModal
        video={video}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}