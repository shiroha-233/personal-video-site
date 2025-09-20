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
  // JSON文件存储配置
};

export default nextConfig;
