'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [videoData, setVideoData] = useState<any>(null)
  const [proxyTest, setProxyTest] = useState<string>('未测试')

  useEffect(() => {
    testAPIs()
  }, [])

  const testAPIs = async () => {
    // 测试健康检查 API
    try {
      const healthResponse = await fetch('/api/health')
      const healthData = await healthResponse.json()
      setApiStatus(healthData)
    } catch (error) {
      setApiStatus({ error: '健康检查失败', details: error })
    }

    // 测试视频数据 API
    try {
      const videoResponse = await fetch('/api/videos')
      const videos = await videoResponse.json()
      setVideoData(videos)
    } catch (error) {
      setVideoData({ error: '视频数据获取失败', details: error })
    }
  }

  const testImageProxy = async () => {
    setProxyTest('测试中...')
    try {
      const testUrl = 'http://i2.hdslb.com/bfs/archive/3366a0185a48f362a6a5e075552f830d001f3fcb.jpg'
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(testUrl)}`
      
      const response = await fetch(proxyUrl)
      if (response.ok) {
        setProxyTest('✅ 代理成功')
      } else {
        setProxyTest(`❌ 代理失败: ${response.status}`)
      }
    } catch (error) {
      setProxyTest(`❌ 代理错误: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">系统测试页面</h1>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首页
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API 状态测试 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">API 状态检查</h2>
              <button 
                onClick={testAPIs}
                className="bg-green-600 text-white px-3 py-1 rounded mb-3 hover:bg-green-700 transition-colors"
              >
                重新测试
              </button>
              
              {apiStatus && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(apiStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* 视频数据测试 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">视频数据测试</h2>
              
              {videoData && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  {Array.isArray(videoData) ? (
                    <div>
                      <p className="text-green-600 font-medium">✅ 数据获取成功</p>
                      <p>视频数量: {videoData.length}</p>
                      {videoData.length > 0 && (
                        <p>第一个视频: {videoData[0].title}</p>
                      )}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-red-600">
                      {JSON.stringify(videoData, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* 图片代理测试 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">图片代理测试</h2>
              <button 
                onClick={testImageProxy}
                className="bg-purple-600 text-white px-3 py-1 rounded mb-3 hover:bg-purple-700 transition-colors"
              >
                测试图片代理
              </button>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600">状态: {proxyTest}</p>
              </div>

              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600 mb-2">测试图片加载:</p>
                <div className="w-32 h-18 border border-gray-300 rounded overflow-hidden">
                  <ImageWithFallback
                    src="http://i2.hdslb.com/bfs/archive/3366a0185a48f362a6a5e075552f830d001f3fcb.jpg"
                    alt="测试图片"
                    width={128}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 环境信息 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">环境信息</h2>
              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                <p><strong>用户代理:</strong> {navigator.userAgent.substring(0, 50)}...</p>
                <p><strong>当前域名:</strong> {window.location.hostname}</p>
                <p><strong>协议:</strong> {window.location.protocol}</p>
                <p><strong>端口:</strong> {window.location.port || '默认'}</p>
                <p><strong>时间:</strong> {new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>

          {/* 快速链接 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">快速链接</h3>
            <div className="flex flex-wrap gap-2">
              <a 
                href="/api/health" 
                target="_blank"
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                健康检查 API
              </a>
              <a 
                href="/api/videos" 
                target="_blank"
                className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
              >
                视频数据 API
              </a>
              <Link 
                href="/admin" 
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
              >
                管理后台
              </Link>
              <Link 
                href="/about" 
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                关于页面
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}