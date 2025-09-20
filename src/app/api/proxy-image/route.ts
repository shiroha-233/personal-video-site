import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 规范化并准备可能的候选 URL（优先 https）
function buildCandidateUrls(rawUrl: string): string[] {
  let u: URL
  try {
    u = new URL(rawUrl)
  } catch {
    throw new Error('无效的图片 URL')
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('仅支持 http/https 协议')
  }

  const original = u.toString()
  const httpsVersion = original.replace(/^http:/i, 'https:')
  const httpVersion = original.replace(/^https:/i, 'http:')

  const list: string[] = []
  // 优先 https，再原始，再回退
  if (httpsVersion !== original) list.push(httpsVersion)
  list.push(original)
  if (httpVersion !== original && httpVersion !== httpsVersion) list.push(httpVersion)

  return Array.from(new Set(list))
}

function buildHeaders(targetUrl: string): Record<string, string> {
  const isBilibili =
    targetUrl.includes('bilibili.com') ||
    targetUrl.includes('hdslb.com') ||
    targetUrl.includes('i0.hdslb.com') ||
    targetUrl.includes('i1.hdslb.com') ||
    targetUrl.includes('i2.hdslb.com')

  const isYoutube =
    targetUrl.includes('youtube.com') ||
    targetUrl.includes('ytimg.com') ||
    targetUrl.includes('img.youtube.com')

  const referer = isBilibili
    ? 'https://www.bilibili.com/'
    : isYoutube
    ? 'https://www.youtube.com/'
    : 'https://www.google.com/'

  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'Referer': referer,
    'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 8000, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('url')

  if (!raw) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 })
  }

  try {
    const candidates = buildCandidateUrls(raw)
    let lastError: string | null = null

    for (const candidate of candidates) {
      try {
        const res = await fetchWithTimeout(candidate, 9000, {
          headers: buildHeaders(candidate),
        })

        if (!res.ok) {
          lastError = `HTTP ${res.status} ${res.statusText} @ ${candidate}`
          continue
        }

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) {
          lastError = `非图片响应 content-type=${contentType} @ ${candidate}`
          continue
        }

        const buf = await res.arrayBuffer()
        return new NextResponse(buf, {
          headers: {
            'Content-Type': contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        // 超时/Abort 继续试下一个候选
        lastError = `请求失败: ${msg} @ ${candidate}`
        continue
      }
    }

    // 全部失败
    return NextResponse.json(
      {
        error: '图片代理失败',
        details: lastError ?? '未知错误',
        requestedUrl: raw,
      },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: '请求处理失败',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestedUrl: raw,
      },
      { status: 400 }
    )
  }
}