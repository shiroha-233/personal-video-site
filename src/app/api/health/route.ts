import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos } from '@/lib/data'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    // 测试数据获取
    let videoTest = { status: 'unknown', count: 0, error: null }
    try {
      const videos = await getAllVideos()
      videoTest = { 
        status: videos.length > 0 ? 'working' : 'no-data', 
        count: videos.length, 
        error: null 
      }
    } catch (error) {
      videoTest = { 
        status: 'error', 
        count: 0, 
        error: error instanceof Error ? error.message : 'unknown' 
      }
    }

    // 基础环境信息
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'unknown',
        CF_PAGES: process.env.CF_PAGES || 'false',
        CF_PAGES_URL: process.env.CF_PAGES_URL || 'not-set',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'not-set',
        deployment: process.env.CF_PAGES ? 'cloudflare-pages' : 'local'
      },
      runtime: 'edge',
      request: {
        host: url.host,
        pathname: url.pathname,
        userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown'
      },
      cloudflare: {
        ray: request.headers.get('cf-ray') || 'not-available',
        country: request.headers.get('cf-ipcountry') || 'unknown',
        datacenter: request.headers.get('cf-ray')?.split('-')[1] || 'unknown'
      },
      services: {
        dataAccess: videoTest,
        edgeRuntime: {
          fetch: typeof fetch !== 'undefined',
          AbortController: typeof AbortController !== 'undefined',
          queueMicrotask: typeof queueMicrotask !== 'undefined',
          URL: typeof URL !== 'undefined'
        }
      },
      diagnostics: {
        apiEndpoints: {
          '/api/videos': 'should work',
          '/api/proxy-image': 'may have CORS issues',
          '/api/extract-cover': 'depends on external APIs'
        },
        commonIssues: [
          'Image proxy may fail due to CORS restrictions',
          'External API calls may timeout in Edge Runtime',
          'Static file access may be limited'
        ],
        recommendations: [
          'Check browser console for specific errors',
          'Verify network connectivity to external APIs',
          'Test individual API endpoints manually'
        ]
      }
    }

    return NextResponse.json(healthInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'unknown',
        CF_PAGES: process.env.CF_PAGES || 'false'
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}