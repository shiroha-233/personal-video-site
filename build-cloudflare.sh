#!/bin/bash

# Cloudflare 构建脚本
echo "🚀 开始 Cloudflare 构建流程..."

# 安装依赖
echo "📦 安装依赖..."
npm install --legacy-peer-deps

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 构建项目
echo "🏗️ 构建项目..."
npm run cf:build

# 使用 @cloudflare/next-on-pages 优化
echo "⚡ 优化 Cloudflare Pages..."
npx @cloudflare/next-on-pages

echo "✅ 构建完成！"