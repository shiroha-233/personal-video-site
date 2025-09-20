'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const testImageUrl = 'http://i2.hdslb.com/bfs/archive/3366a0185a48f362a6a5e075552f830d001f3fcb.jpg'
  const proxyImageUrl = `/api/proxy-image?url=${encodeURIComponent(testImageUrl)}`

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/test-image?url=${encodeURIComponent(testImageUrl)}`)
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">图片代理测试</h1>
      
      <div className="space-y-6">
        {/* 测试按钮 */}
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? '测试中...' : '运行测试'}
        </button>

        {/* 测试结果 */}
        {testResults && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        {/* 图片测试 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">原始图片 URL</h3>
            <p className="text-sm text-gray-600 break-all">{testImageUrl}</p>
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={testImageUrl}
                alt="原始图片"
                width={400}
                height={200}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('原始图片加载失败')
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">代理图片 URL</h3>
            <p className="text-sm text-gray-600 break-all">{proxyImageUrl}</p>
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={proxyImageUrl}
                alt="代理图片"
                width={400}
                height={200}
                className="w-full h-full object-cover"
                unoptimized
                onError={(e) => {
                  console.log('代理图片加载失败')
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('代理图片加载成功')
                }}
              />
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">测试说明</h3>
          <ul className="text-sm space-y-1">
            <li>• 左侧显示原始 B站 图片 URL（可能被 CORS 阻止）</li>
            <li>• 右侧显示通过代理 API 的图片</li>
            <li>• 点击"运行测试"查看详细的网络请求结果</li>
            <li>• 检查浏览器控制台查看加载状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
}