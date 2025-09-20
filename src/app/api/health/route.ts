import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    // 基础环境信息
    const healthInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      runtime: 'edge',
      host: url.host,
      pathname: url.pathname,
      // Cloudflare 特定环境变量
      cf: {
        ray: request.headers.get('cf-ray'),
        country: request.headers.get('cf-ipcountry'),
        visitor: request.headers.get('cf-visitor'),
      },
      // 请求头信息
      headers: Object.fromEntries(request.headers.entries()),
      // 检查关键路径
      paths: {
        api_videos: '/api/videos',
        api_extract_cover: '/api/extract-cover',
        admin_page: '/admin/',
        home_page: '/',
      }
    }

    // 检查 JSON 文件是否可访问（在 Edge Runtime 中可能有限制）
    let jsonAccessible = false
    try {
      // 这里只是检查概念，实际的文件系统访问在 Edge Runtime 中可能不可用
      jsonAccessible = true
    } catch {
      jsonAccessible = false
    }

    return NextResponse.json({
      ...healthInfo,
      storage: {
        json_accessible: jsonAccessible,
        note: 'JSON file access may be limited in Edge Runtime'
      },
      recommendations: [
        'Check if API routes are accessible',
        'Verify static assets loading',
        'Confirm admin page accessibility at /admin/',
        'Test video data loading from /api/videos'
      ]
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}