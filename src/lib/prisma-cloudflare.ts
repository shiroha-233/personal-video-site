// Cloudflare D1 专用的 Prisma 配置

// 用于 Cloudflare 环境的初始化函数  
export async function createCloudflareClient(env: any): Promise<any> {
  try {
    // 检查是否有 D1 数据库绑定
    if (!env.DB) {
      console.log('⚠️ D1 数据库未配置，回退到本地模式')
      return await createLocalClient()
    }
    
    // 动态导入以兼容 Edge Runtime
    const [prismaModule, d1Module] = await Promise.all([
      import('@prisma/client'),
      import('@prisma/adapter-d1')
    ])
    
    const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
    const PrismaD1 = (d1Module as any).PrismaD1 || (d1Module as any).default?.PrismaD1
    
    const adapter = new PrismaD1(env.DB) as any
    console.log('✨ 成功连接 Cloudflare D1 数据库')
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to create Cloudflare client:', error)
    // 回退到基础的 PrismaClient
    console.log('⚠️ 回退到本地数据库模式')
    return await createLocalClient()
  }
}

// 用于本地开发的 PrismaClient 创建函数
export async function createLocalClient(): Promise<any> {
  const prismaModule = await import('@prisma/client')
  const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
  return new PrismaClient()
}