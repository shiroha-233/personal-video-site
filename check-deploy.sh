#!/bin/bash

# Cloudflare 部署前检查脚本

echo "🔍 检查 Cloudflare 部署配置..."

# 检查必要的配置文件
echo "📁 检查配置文件..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 缺少 wrangler.toml 配置文件"
    exit 1
fi

if [ ! -f "next.config.ts" ]; then
    echo "❌ 缺少 next.config.ts 配置文件"
    exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ 缺少 Prisma schema 文件"
    exit 1
fi

# 检查 package.json 中的必要依赖
echo "📦 检查依赖..."
if ! grep -q "@cloudflare/next-on-pages" package.json; then
    echo "❌ 缺少 @cloudflare/next-on-pages 依赖"
    exit 1
fi

if ! grep -q "@prisma/adapter-d1" package.json; then
    echo "❌ 缺少 @prisma/adapter-d1 依赖"
    exit 1
fi

# 检查 Next.js 版本兼容性
echo "🔄 检查 Next.js 版本..."
NEXT_VERSION=$(npm list next --depth=0 2>/dev/null | grep next@ | sed 's/.*next@\([0-9.]*\).*/\1/')
echo "当前 Next.js 版本: $NEXT_VERSION"

# 检查 GitHub Actions 配置
echo "🚀 检查 GitHub Actions..."
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "⚠️  缺少 GitHub Actions 部署配置"
fi

# 检查数据库配置
echo "🗄️  检查数据库配置..."
if grep -q "your-d1-database-url" wrangler.toml; then
    echo "⚠️  wrangler.toml 中仍有占位符，请更新为实际的数据库配置"
fi

# 构建测试
echo "🔨 测试构建..."
npm run cf:build
if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "🎉 Cloudflare 部署配置检查完成！"
echo ""
echo "下一步："
echo "1. 确保 GitHub Secrets 已配置 (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)"
echo "2. 推送代码到 GitHub 触发自动部署"
echo "3. 或使用 'wrangler pages deploy .vercel/output/static' 手动部署"