import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
  // Cloudflare Pages 配置
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: '.vercel/output/static',
  /* config options here */
};

export default nextConfig;
