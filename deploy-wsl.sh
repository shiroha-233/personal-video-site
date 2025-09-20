#!/bin/bash

# WSL环境下的Cloudflare部署脚本

echo "🚀 开始WSL环境下的Cloudflare部署..."

# 检查WSL环境
if [[ ! -v WSL_DISTRO_NAME ]] && [[ ! -f /proc/version ]] || ! grep -qi microsoft /proc/version 2>/dev/null; then
    echo "❌ 请在WSL环境中运行此脚本"
    exit 1
fi

# 设置项目路径（Windows路径映射到WSL）
PROJECT_PATH="/mnt/e/Github/personal-video-site"
cd "$PROJECT_PATH" || exit 1

echo "📍 当前目录: $(pwd)"

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo "📦 安装依赖..."
npm ci --legacy-peer-deps

# 生成Prisma客户端
echo "🏗️ 生成Prisma客户端..."
npx prisma generate

# 构建Next.js应用
echo "🔨 构建Next.js应用..."
npm run cf:build

# 使用Cloudflare适配器
echo "⚡ 应用Cloudflare适配器..."
npx @cloudflare/next-on-pages

# 检查输出目录
if [ -d ".vercel/output/static" ]; then
    echo "✅ Cloudflare兼容输出已生成: .vercel/output/static"
    
    # 部署到Cloudflare Pages
    echo "🌍 部署到Cloudflare Pages..."
    npx wrangler pages deploy .vercel/output/static --project-name=personal-video-site --commit-dirty=true
    
    echo "🎉 部署完成！"
    echo "🌐 访问您的网站: https://personal-video-site.pages.dev"
else
    echo "❌ 构建输出目录不存在，部署失败"
    exit 1
fi