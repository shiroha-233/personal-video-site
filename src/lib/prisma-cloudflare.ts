// Cloudflare D1 专用的 Prisma 配置
import { PrismaClient } from '@prisma/client'

// 全局声明，避免在开发环境中重复创建实例
declare global {
  var __prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (typeof window === 'undefined') {
  // 服务器端逻辑
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('d1')) {
    // 生产环境使用 Cloudflare D1
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  } else {
    // 开发环境使用 SQLite
    if (global.__prisma) {
      prisma = global.__prisma
    } else {
      prisma = new PrismaClient()
      global.__prisma = prisma
    }
  }
}

export { prisma }

// 用于 Cloudflare 环境的初始化函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCloudflareClient(env: any): Promise<PrismaClient> {
  try {
    const { PrismaD1 } = await import('@prisma/adapter-d1')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaD1(env.DB) as any
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to create Cloudflare client:', error)
    return new PrismaClient()
  }
}