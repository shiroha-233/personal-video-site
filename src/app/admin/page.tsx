'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Resource {
  name: string
  type: string
  url: string
  password?: string
  description?: string
}

interface Video {
  id: string
  title: string
  description: string
  coverImage: string
  videoUrl?: string
  duration?: string
  publishDate: string
  resources: Resource[]
  tags: string[]
}

export default function AdminPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [editingIndex, setEditingIndex] = useState(-1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    videoUrl: '',
    tags: '',
    duration: ''
  })
  const [resources, setResources] = useState<Resource[]>([])
  const [isExtractingCover, setIsExtractingCover] = useState(false)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
        console.log('✅ 从 API 加载了', data.length, '个视频')
      } else {
        throw new Error('API响应错误')
      }
    } catch (error) {
      console.error('❌ 加载数据失败:', error)
      alert('⚠️ 无法连接到服务器，请确保应用正在运行\n请使用 npm run dev 启动开发服务器')
      setVideos([])
    }
  }

  const addNewVideo = () => {
    setEditingIndex(-1)
    setFormData({
      title: '',
      description: '',
      coverImage: '',
      videoUrl: '',
      tags: '',
      duration: ''
    })
    setResources([])
  }

  const editVideo = (index: number) => {
    setEditingIndex(index)
    const video = videos[index]
    
    setFormData({
      title: video.title,
      description: video.description,
      coverImage: video.coverImage,
      videoUrl: video.videoUrl || '',
      tags: video.tags.join(', '),
      duration: video.duration || ''
    })
    
    setResources(video.resources)
  }

  const saveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('请输入视频标题')
      return
    }
    
    const videoData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      coverImage: formData.coverImage.trim() || '/covers/default.svg',
      videoUrl: formData.videoUrl.trim() || undefined,
      resources: resources.filter(resource => resource.name && resource.url),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      duration: formData.duration.trim() || undefined
    }
    
    console.log('💾 准备保存视频数据:', videoData)
    console.log('📝 编辑模式:', editingIndex === -1 ? '新增' : '更新')
    
    try {
      let response
      if (editingIndex === -1) {
        // 新增
        console.log('➕ 发送新增请求到 /api/videos')
        response = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(videoData)
        })
      } else {
        // 更新
        const videoId = videos[editingIndex].id
        console.log('🔄 发送更新请求到 /api/videos/' + videoId)
        response = await fetch(`/api/videos/${videoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(videoData)
        })
      }
      
      console.log('📡 保存请求响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 保存响应:', result)
        alert('✅ 视频保存成功！')
        await loadVideos()
        cancelEdit()
      } else {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        console.error('❌ 保存失败响应:', errorData)
        throw new Error(errorData.error || '服务器响应错误')
      }
    } catch (error) {
      console.error('❌ 保存失败:', error)
      alert(`❌ 保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const deleteVideo = async () => {
    if (editingIndex !== -1 && confirm('确定要删除这个视频吗？')) {
      try {
        const videoId = videos[editingIndex].id
        console.log('🗑️ 准备删除视频, ID:', videoId)
        
        const response = await fetch(`/api/videos/${videoId}`, {
          method: 'DELETE'
        })
        
        console.log('📡 删除请求响应状态:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('✅ 删除响应:', result)
          alert('✅ 视频删除成功！')
          await loadVideos()
          cancelEdit()
        } else {
          const errorData = await response.json().catch(() => ({ error: '未知错误' }))
          console.error('❌ 删除失败响应:', errorData)
          throw new Error(errorData.error || '服务器响应错误')
        }
      } catch (error) {
        console.error('❌ 删除失败:', error)
        alert(`❌ 删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
  }

  const cancelEdit = () => {
    setEditingIndex(-1)
    setFormData({
      title: '',
      description: '',
      coverImage: '',
      videoUrl: '',
      tags: '',
      duration: ''
    })
    setResources([])
  }

  const addResource = () => {
    setResources([...resources, {
      name: '',
      type: 'other',
      url: '',
      password: '',
      description: ''
    }])
  }

  const updateResource = (index: number, field: keyof Resource, value: string) => {
    const updatedResources = [...resources]
    updatedResources[index] = { ...updatedResources[index], [field]: value }
    setResources(updatedResources)
  }

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index))
  }

  // 提取视频封面
  const extractCover = async (videoUrl?: string) => {
    const url = videoUrl || formData.videoUrl
    if (!url.trim()) {
      alert('请先输入视频链接')
      return
    }

    setIsExtractingCover(true)
    try {
      const response = await fetch('/api/extract-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            coverImage: data.coverUrl || prev.coverImage,
            title: (prev.title || data.title) ? (prev.title || data.title) : prev.title,
            duration: (prev.duration || data.duration) ? (prev.duration || data.duration) : prev.duration
          }))
          alert(`✅ 成功提取${data.platform === 'bilibili' ? 'B站' : data.platform === 'youtube' ? 'YouTube' : ''}视频信息！`)
        } else {
          throw new Error(data.error)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '提取失败')
      }
    } catch (error) {
      console.error('提取封面失败:', error)
      alert(`❌ 提取失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExtractingCover(false)
    }
  }

  // 视频链接变化时自动尝试提取
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setFormData({...formData, videoUrl: newUrl})
    
    // 如果URL看起来是完整的视频链接，自动尝试提取
    if (newUrl && (newUrl.includes('bilibili.com') || newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) && newUrl.includes('http')) {
      // 延迟一下避免频繁请求
      setTimeout(() => {
        if (formData.videoUrl === newUrl) {
          extractCover(newUrl)
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">视频资源管理后台</h1>
            <div className="space-x-2">
              <Link 
                href="/" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🏠 返回首页
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 使用说明 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="text-amber-900 font-semibold mb-2">⚠️ 开发版本说明</h3>
          <div className="text-amber-800 text-sm space-y-1">
            <p><strong>📋 当前状态:</strong> Edge Runtime 模式，数据存储在内存中</p>
            <p><strong>🎯 功能特性:</strong> 完整的增删改查功能，重启后数据重置</p>
            <p><strong>💾 数据存储:</strong> 部署后数据变更仅在当前会话有效</p>
            <p><strong>🛠️ 本地开发:</strong> 使用 <code className="bg-amber-200 px-1 rounded">npm run dev</code> 可获得持久化存储</p>
            <p><strong>🔗 诊断工具:</strong> 访问 <a href="/api/health" target="_blank" className="text-blue-600 underline">/api/health</a> 查看系统状态</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 视频列表 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">视频列表</h2>
              <button 
                onClick={addNewVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加视频
              </button>
            </div>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div 
                  key={video.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" 
                  onClick={() => editVideo(index)}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.publishDate}</span>
                    <span>{video.resources.length} 个资源</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 编辑表单 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">编辑视频</h2>
            <form onSubmit={saveVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频标题</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="输入视频标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频描述</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="输入视频描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">封面图片URL</label>
                <input 
                  type="text" 
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="输入封面图片URL"
                />
                {formData.coverImage && (
                  <div className="mt-2">
                    <Image 
                      src={(() => {
                        try {
                          const urlObj = new URL(formData.coverImage)
                          const needsProxy = [
                            'hdslb.com',
                            'i0.hdslb.com', 
                            'i1.hdslb.com',
                            'i2.hdslb.com',
                            'bilibili.com',
                            'img.youtube.com'
                          ].some(domain => urlObj.hostname.includes(domain))
                          
                          return needsProxy 
                            ? `/api/proxy-image?url=${encodeURIComponent(formData.coverImage)}` 
                            : formData.coverImage
                        } catch {
                          return formData.coverImage
                        }
                      })()} 
                      alt="封面预览" 
                      width={128}
                      height={72}
                      className="w-32 h-18 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频链接</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={formData.videoUrl}
                    onChange={handleVideoUrlChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="输入视频观看链接（支持B站、YouTube）"
                  />
                  <button 
                    type="button"
                    onClick={() => extractCover()}
                    disabled={isExtractingCover || !formData.videoUrl.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isExtractingCover ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>提取中...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>提取封面</span>
                      </>
                    )}
                  </button>
                </div>
                {formData.videoUrl && (
                  <div className="mt-1 text-xs text-gray-500">
                    ℹ️ 支持自动识别B站、YouTube链接并提取封面图、标题和时长
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签 (逗号分隔)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="React, 前端, 教程"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">时长</label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="25:30"
                />
              </div>

              {/* 资源列表 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">下载资源</label>
                <div className="space-y-3 mb-3">
                  {resources.map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input 
                          type="text" 
                          value={resource.name}
                          onChange={(e) => updateResource(index, 'name', e.target.value)}
                          placeholder="资源名称" 
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select 
                          value={resource.type}
                          onChange={(e) => updateResource(index, 'type', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          aria-label="资源类型"
                        >
                          <option value="other">其他</option>
                          <option value="github">GitHub</option>
                          <option value="baidu">百度网盘</option>
                          <option value="aliyun">阿里云盘</option>
                          <option value="onedrive">OneDrive</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input 
                          type="url" 
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          placeholder="资源链接" 
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input 
                          type="text" 
                          value={resource.password || ''}
                          onChange={(e) => updateResource(index, 'password', e.target.value)}
                          placeholder="提取码" 
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={resource.description || ''}
                          onChange={(e) => updateResource(index, 'description', e.target.value)}
                          placeholder="资源描述" 
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button 
                          type="button" 
                          onClick={() => removeResource(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={addResource}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + 添加资源
                </button>
              </div>

              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存视频
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
                {editingIndex !== -1 && (
                  <button 
                    type="button" 
                    onClick={deleteVideo}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    删除视频
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}