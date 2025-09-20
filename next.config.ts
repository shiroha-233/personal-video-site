import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 警告：在构建过程中忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 警告：在构建过程中忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bilibili.com',
      },
      {
        protocol: 'https',
        hostname: '*.hdslb.com',
      },
      {
        protocol: 'http',
        hostname: '*.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'puui.qpic.cn',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      }
    ],
  },
  // Cloudflare Pages 配置 - 支持 API 路由和 D1 数据库
};

export default nextConfig;
