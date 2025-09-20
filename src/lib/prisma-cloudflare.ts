import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// 全局变量声明
declare global {
  var __prisma: PrismaClient | undefined
  // Cloudflare 环境变量类型
  interface CloudflareEnv {
    DB?: D1Database
    [key: string]: any
  }
}

// 创建 Prisma 客户端的函数
function createPrismaClient() {
  // 检查是否在 Cloudflare 环境中
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 本地开发环境，使用常规 Prisma 客户端
    console.log('🏠 本地开发环境，使用 SQLite 数据库')
    return new PrismaClient()
  }

  // 尝试获取 Cloudflare D1 数据库绑定
  let db: D1Database | undefined

  try {
    // 在 Cloudflare Pages/Workers 环境中
    if (typeof globalThis !== 'undefined' && (globalThis as any).DB) {
      db = (globalThis as any).DB
      console.log('🌐 使用 Cloudflare D1 数据库 (globalThis)')
    } else if (typeof process !== 'undefined' && process.env.DB) {
      // 如果通过环境变量传递
      db = process.env.DB as any
      console.log('🌐 使用 Cloudflare D1 数据库 (process.env)')
    }
  } catch (error) {
    console.warn('⚠️ 获取 D1 数据库失败:', error)
  }

  if (db) {
    // 使用 D1 适配器
    console.log('🗄️ 创建 Cloudflare D1 Prisma 客户端...')
    const adapter = new PrismaD1(db)
    return new PrismaClient({ adapter })
  } else {
    // 后备：使用常规客户端（可能在非 Cloudflare 环境中）
    console.log('📁 使用后备 Prisma 客户端')
    return new PrismaClient()
  }
}

// 获取 Prisma 客户端实例
export function getPrismaClient(): PrismaClient {
  if (typeof globalThis !== 'undefined' && globalThis.__prisma) {
    return globalThis.__prisma
  }

  const prisma = createPrismaClient()
  
  if (typeof globalThis !== 'undefined') {
    globalThis.__prisma = prisma
  }

  return prisma
}

// 默认导出
const prisma = getPrismaClient()
export default prisma