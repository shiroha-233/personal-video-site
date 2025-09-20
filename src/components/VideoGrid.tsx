'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import VideoCard from './VideoCard'
import { Video } from '@/types/video'

interface VideoGridProps {
  searchQuery?: string
  selectedTag?: string
}

export default function VideoGrid({ searchQuery, selectedTag }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // 加载视频数据
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        // 优先尝试API，失败时使用静态数据
        const response = await fetch('/api/videos')
        
        if (response.ok) {
          const data = await response.json()
          setVideos(data)
          setFilteredVideos(data)
        } else {
          // 如果API失败，尝试静态文件
          const fallbackResponse = await fetch('/videos.json')
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json()
            setVideos(data)
            setFilteredVideos(data)
          } else {
            throw new Error('获取视频失败')
          }
        }
      } catch (error) {
        console.error('加载视频失败:', error)
        // 后备空数据
        setVideos([])
        setFilteredVideos([])
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  // 处理搜索和筛选
  useEffect(() => {
    let filtered = videos

    if (searchQuery) {
      filtered = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedTag) {
      filtered = filtered.filter(video =>
        video.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()))
      )
    }

    setFilteredVideos(filtered)
  }, [searchQuery, selectedTag, videos])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-40 sm:h-48 mb-4"></div>
            <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 mb-2"></div>
            <div className="bg-gray-300 dark:bg-gray-700 rounded h-3 w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredVideos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          没有找到相关视频
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          试试其他关键词或浏览所有视频
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      {filteredVideos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <VideoCard video={video} />
        </motion.div>
      ))}
    </motion.div>
  )
}