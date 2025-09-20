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
  },
  // 静态导出配置 - 支持 Cloudflare Pages 部署
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // JSON文件存储配置 - 支持完整 API 功能
};

export default nextConfig;
