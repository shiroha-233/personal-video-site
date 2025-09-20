// Cloudflare Function for video API
export interface Env {
  DB: any; // D1Database type not available in functions
}

interface Video {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  videoUrl: string;
  duration: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;
  
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('API调用: /api/videos');
    
    if (!env.DB) {
      console.error('D1数据库未配置');
      return new Response(JSON.stringify({ 
        error: 'Database not configured',
        fallback: 'Using static data'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 查询数据库
    console.log('查询D1数据库...');
    const result = await env.DB.prepare(`
      SELECT id, title, description, coverImage, videoUrl, duration, publishDate, createdAt, updatedAt
      FROM videos 
      ORDER BY publishDate DESC
    `).all();

    console.log('D1查询结果:', result);

    if (!result.success) {
      throw new Error('Database query failed');
    }

    const videos: Video[] = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      coverImage: row.coverImage,
      videoUrl: row.videoUrl,
      duration: row.duration,
      publishDate: row.publishDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    console.log('返回视频数量:', videos.length);

    return new Response(JSON.stringify(videos), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    
    // 返回后备静态数据
    const fallbackVideos: Video[] = [
      {
        id: "fallback-1",
        title: "连接D1数据库失败 - 后备视频1",
        description: "这是后备数据，D1数据库连接失败时显示",
        coverImage: "https://via.placeholder.com/480x270/6366f1/ffffff?text=Fallback+Video+1",
        videoUrl: "https://www.bilibili.com/video/BV1234567890",
        duration: "10:00",
        publishDate: "2024-01-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "fallback-2",
        title: "连接D1数据库失败 - 后备视频2",
        description: "这是后备数据，D1数据库连接失败时显示",
        coverImage: "https://via.placeholder.com/480x270/f59e0b/ffffff?text=Fallback+Video+2",
        videoUrl: "https://www.bilibili.com/video/BV9876543210",
        duration: "15:30",
        publishDate: "2024-01-02",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return new Response(JSON.stringify(fallbackVideos), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}