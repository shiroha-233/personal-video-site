import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    // 检查环境变量
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: process.env.CF_PAGES,
      CF_PAGES_URL: process.env.CF_PAGES_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    }
    
    // 检查基本功能
    const testFetch = async () => {
      try {
        // 测试是否能访问公共文件
        const response = await fetch('/videos.json', { method: 'HEAD' })
        return {
          success: response.ok,
          status: response.status
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    const fetchTest = await testFetch()
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      tests: {
        fetchPublicFile: fetchTest
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}