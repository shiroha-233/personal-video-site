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
    // 配置允许的外部图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: '**.bilibili.com',
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  // Cloudflare Pages 优化配置
  trailingSlash: true,
  // 添加安全头配置
  async headers() {
    return [
      {
        source: '/api/proxy-image',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
