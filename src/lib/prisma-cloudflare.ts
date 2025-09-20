// Cloudflare D1 专用的 Prisma 配置

// 用于 Cloudflare 环境的初始化函数  
export async function createCloudflareClient(env: any): Promise<any> {
  try {
    // 动态导入以兼容 Edge Runtime
    const [prismaModule, d1Module] = await Promise.all([
      import('@prisma/client'),
      import('@prisma/adapter-d1')
    ])
    
    const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
    const PrismaD1 = (d1Module as any).PrismaD1 || (d1Module as any).default?.PrismaD1
    
    const adapter = new PrismaD1(env.DB) as any
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to create Cloudflare client:', error)
    // 回退到基础的 PrismaClient
    const prismaModule = await import('@prisma/client')
    const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
    return new PrismaClient()
  }
}

// 用于本地开发的 PrismaClient 创建函数
export async function createLocalClient(): Promise<any> {
  const prismaModule = await import('@prisma/client')
  const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
  return new PrismaClient()
}