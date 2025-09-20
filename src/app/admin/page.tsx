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
  const [isExtracting, setIsExtracting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    videoUrl: '',
    tags: '',
    duration: ''
  })
  const [resources, setResources] = useState<Resource[]>([])  

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
    
    try {
      let response
      if (editingIndex === -1) {
        // 新增
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
        response = await fetch(`/api/videos/${videoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(videoData)
        })
      }
      
      if (response.ok) {
        alert('✅ 视频保存成功！')
        await loadVideos()
        cancelEdit()
      } else {
        throw new Error('服务器响应错误')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('❌ 保存失败，请检查网络连接和服务器状态')
    }
  }

  const deleteVideo = async () => {
    if (editingIndex !== -1 && confirm('确定要删除这个视频吗？')) {
      try {
        const videoId = videos[editingIndex].id
        const response = await fetch(`/api/videos/${videoId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('✅ 视频删除成功！')
          await loadVideos()
          cancelEdit()
        } else {
          throw new Error('服务器响应错误')
        }
      } catch (error) {
        console.error('删除失败:', error)
        alert('❌ 删除失败，请检查网络连接和服务器状态')
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

  // 自动提取视频封面和信息
  const extractVideoInfo = async () => {
    if (!formData.videoUrl.trim()) {
      alert('请先输入视频链接')
      return
    }

    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: formData.videoUrl.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // 自动填充提取到的信息
        setFormData(prev => ({
          ...prev,
          title: result.data.title || prev.title,
          description: result.data.description || prev.description,
          coverImage: result.data.coverImage || prev.coverImage,
          duration: result.data.duration || prev.duration
        }))
        
        alert(`✅ 成功提取${result.platform}视频信息！\n` + 
              `${result.data.title ? '标题: ' + result.data.title + '\n' : ''}` +
              `${result.data.coverImage ? '封面: 已下载保存\n' : ''}` +
              `${result.data.duration ? '时长: ' + result.data.duration : ''}`)
      } else {
        throw new Error(result.error || '提取失败')
      }
    } catch (error) {
      console.error('提取封面失败:', error)
      alert('❌ 封面提取失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsExtracting(false)
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
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="text-green-900 font-semibold mb-2">✅ API 功能正常</h3>
          <div className="text-green-800 text-sm space-y-1">
            <p><strong>📋 当前状态:</strong> 本地开发模式，支持完整的增删改查功能</p>
            <p><strong>🎯 功能特性:</strong> JSON 文件存储 + 本地 API 路由 + 自动封面提取</p>
            <p><strong>💾 数据存储:</strong> 所有修改将保存到 videos.json 文件</p>
            <p><strong>🎨 封面提取:</strong> 支持自动提取 B站、YouTube 视频封面和信息</p>
            <p><strong>🛠️ 使用方法:</strong> 请确保使用 <code className="bg-green-200 px-1 rounded">npm run dev</code> 启动服务</p>
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
                  placeholder="输入封面图片URL（或使用上方自动提取）"
                />
                {formData.coverImage && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">封面预览：</p>
                    <div className="border border-gray-200 rounded-lg p-2 inline-block bg-gray-50">
                      <Image 
                        src={formData.coverImage.includes('hdslb.com') 
                          ? `/api/proxy-image?url=${encodeURIComponent(formData.coverImage)}` 
                          : formData.coverImage
                        } 
                        alt="封面预览" 
                        width={200}
                        height={120}
                        className="w-50 h-30 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/covers/default.svg'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频链接</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="输入视频观看链接（支持 B站、YouTube）"
                  />
                  <button 
                    type="button"
                    onClick={extractVideoInfo}
                    disabled={isExtracting || !formData.videoUrl.trim()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isExtracting || !formData.videoUrl.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isExtracting ? '🔄 提取中...' : '🎨 提取封面'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💡 支持自动提取 B站、YouTube 视频的封面、标题、时长等信息
                </p>
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