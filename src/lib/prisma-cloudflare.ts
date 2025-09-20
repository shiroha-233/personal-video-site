// Cloudflare D1 专用的 Prisma 配置

// 用于 Cloudflare 环境的初始化函数  
export async function createCloudflareClient(env: any): Promise<any> {
  try {
    console.log('🔍 检查 D1 数据库绑定...')
    
    // 检查是否有 D1 数据库绑定
    if (!env || !env.DB) {
      console.log('⚠️ D1 数据库未配置或未绑定，回退到本地模式')
      console.log('📄 环境信息:', { env: typeof env, hasDB: !!env?.DB })
      throw new Error('D1 database not available, cannot use Cloudflare client')
    }
    
    console.log('✨ 找到 D1 数据库绑定，创建客户端...')
    
    // 动态导入以兼容 Edge Runtime
    const [prismaModule, d1Module] = await Promise.all([
      import('@prisma/client'),
      import('@prisma/adapter-d1')
    ])
    
    const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
    const PrismaD1 = (d1Module as any).PrismaD1 || (d1Module as any).default?.PrismaD1
    
    if (!PrismaClient || !PrismaD1) {
      throw new Error(`缺少必要的类: PrismaClient=${!!PrismaClient}, PrismaD1=${!!PrismaD1}`)
    }
    
    const adapter = new PrismaD1(env.DB)
    const client = new PrismaClient({ adapter })
    
    console.log('✅ 成功创建 Cloudflare D1 客户端')
    return client
    
  } catch (error) {
    console.error('❌ 创建 Cloudflare 客户端失败:', error)
    throw error // 不再回退，明确失败
  }
}

// 创建假数据用于演示（当数据库不可用时）
export async function createMockClient(): Promise<any> {
  console.log('🎭 创建模拟数据客户端...')
  
  const mockVideos = [
    {
      id: 'mock-video-1',
      title: '演示视频 1',
      description: '这是一个演示视频，展示系统功能',
      coverImage: 'https://via.placeholder.com/300x200?text=Demo+Video+1',
      videoUrl: 'https://example.com/video1',
      duration: 120,
      publishDate: '2025-09-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resources: [
        {
          name: '演示资源',
          type: '文档',
          url: 'https://example.com/resource1',
          password: null,
          description: '相关文档'
        }
      ],
      tags: ['演示', 'Next.js']
    },
    {
      id: 'mock-video-2', 
      title: '演示视频 2',
      description: '另一个演示视频',
      coverImage: 'https://via.placeholder.com/300x200?text=Demo+Video+2',
      videoUrl: 'https://example.com/video2',
      duration: 180,
      publishDate: '2025-09-19',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resources: [],
      tags: ['演示', 'Cloudflare']
    }
  ]
  
  return {
    video: {
      findMany: async () => {
        console.log('📀 返回模拟视频数据')
        return mockVideos
      },
      create: async (data: any) => {
        console.log('➕ 模拟创建视频:', data.data.title)
        return { ...data.data, id: `mock-${Date.now()}` }
      }
    },
    tag: {
      findUnique: async () => null,
      create: async (data: any) => ({ ...data.data, id: `mock-tag-${Date.now()}` })
    },
    videoTag: {
      create: async () => ({ id: `mock-relation-${Date.now()}` })
    }
  }
}