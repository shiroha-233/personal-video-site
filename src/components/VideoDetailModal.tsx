'use client'

import { useEffect } from 'react'
// import Image from 'next/image' // 暂时未使用
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Github, FolderOpen, Copy, ExternalLink, Calendar, Clock, Tag } from 'lucide-react'
import { Video, Resource } from '@/types/video'

interface VideoDetailModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

export default function VideoDetailModal({ video, isOpen, onClose }: VideoDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'github':
        return <Github className="w-5 h-5" />
      case 'baidu':
        return <FolderOpen className="w-5 h-5" />
      case 'aliyun':
        return <FolderOpen className="w-5 h-5" />
      case 'onedrive':
        return <FolderOpen className="w-5 h-5" />
      default:
        return <Download className="w-5 h-5" />
    }
  }

  const getResourceTypeLabel = (type: Resource['type']) => {
    switch (type) {
      case 'github':
        return 'GitHub'
      case 'baidu':
        return '百度网盘'
      case 'aliyun':
        return '阿里云盘'
      case 'onedrive':
        return 'OneDrive'
      default:
        return '其他'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // 这里可以添加提示信息
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden mt-4 sm:mt-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="关闭对话框"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {video.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{formatDate(video.publishDate)}</span>
                  <span className="sm:hidden">{new Date(video.publishDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                </div>
                
                {video.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{video.duration}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{video.resources.length} 个资源</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
            <div className="p-4 sm:p-6">
              {/* Video Description */}
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  视频介绍
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  标签
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {video.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-full"
                    >
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Video URL if available */}
              {video.videoUrl && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    视频链接
                  </h3>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-2 text-sm sm:text-base"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>在线观看</span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(video.videoUrl!)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="复制链接"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  下载资源
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {video.resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {resource.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {getResourceTypeLabel(resource.type)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <button
                            onClick={() => copyToClipboard(resource.url)}
                            className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="复制链接"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>访问</span>
                          </a>
                        </div>
                      </div>
                      
                      {resource.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {resource.description}
                        </p>
                      )}
                      
                      {resource.password && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">提取码:</span>
                          <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded font-mono text-xs sm:text-sm">
                            {resource.password}
                          </code>
                          <button
                            onClick={() => copyToClipboard(resource.password!)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm"
                          >
                            复制
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}