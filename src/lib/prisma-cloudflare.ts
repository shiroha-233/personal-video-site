// Cloudflare D1 专用的 Prisma 配置

// 用于 Cloudflare 环境的初始化函数  
export async function createCloudflareClient(env: any): Promise<any> {
  try {
    console.log('🔍 检查 D1 数据库绑定...')
    
    // 检查是否有 D1 数据库绑定
    if (!env || !env.DB) {
      console.log('⚠️ D1 数据库未配置或未绑定，回退到本地模式')
      console.log('📄 环境信息:', { env: typeof env, hasDB: !!env?.DB })
      return await createLocalClient()
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
    console.log('🔄 回退到本地数据库模式')
    return await createLocalClient()
  }
}

// 用于本地开发的 PrismaClient 创建函数
export async function createLocalClient(): Promise<any> {
  try {
    console.log('🏠 创建本地 Prisma 客户端...')
    
    const prismaModule = await import('@prisma/client')
    const PrismaClient = (prismaModule as any).PrismaClient || (prismaModule as any).default?.PrismaClient
    
    if (!PrismaClient) {
      throw new Error('无法导入 PrismaClient')
    }
    
    const client = new PrismaClient()
    console.log('✅ 成功创建本地 Prisma 客户端')
    return client
    
  } catch (error) {
    console.error('❌ 创建本地客户端失败:', error)
    throw error
  }
}