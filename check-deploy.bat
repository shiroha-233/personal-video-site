@echo off
REM Cloudflare 部署前检查脚本 (Windows)

echo 🔍 检查 Cloudflare 部署配置...

REM 检查必要的配置文件
echo 📁 检查配置文件...
if not exist "wrangler.toml" (
    echo ❌ 缺少 wrangler.toml 配置文件
    exit /b 1
)

if not exist "next.config.ts" (
    echo ❌ 缺少 next.config.ts 配置文件
    exit /b 1
)

if not exist "prisma\schema.prisma" (
    echo ❌ 缺少 Prisma schema 文件
    exit /b 1
)

REM 检查 package.json 中的必要依赖
echo 📦 检查依赖...
findstr /c:"@cloudflare/next-on-pages" package.json >nul
if errorlevel 1 (
    echo ❌ 缺少 @cloudflare/next-on-pages 依赖
    exit /b 1
)

findstr /c:"@prisma/adapter-d1" package.json >nul
if errorlevel 1 (
    echo ❌ 缺少 @prisma/adapter-d1 依赖
    exit /b 1
)

REM 检查 GitHub Actions 配置
echo 🚀 检查 GitHub Actions...
if not exist ".github\workflows\deploy.yml" (
    echo ⚠️ 缺少 GitHub Actions 部署配置
)

REM 检查数据库配置
echo 🗄️ 检查数据库配置...
findstr /c:"your-d1-database-url" wrangler.toml >nul
if not errorlevel 1 (
    echo ⚠️ wrangler.toml 中仍有占位符，请更新为实际的数据库配置
)

REM 构建测试
echo 🔨 测试构建...
npm run cf:build
if errorlevel 1 (
    echo ❌ 构建失败
    exit /b 1
)

echo ✅ 构建成功
echo.
echo 🎉 Cloudflare 部署配置检查完成！
echo.
echo 下一步：
echo 1. 确保 GitHub Secrets 已配置 (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
echo 2. 推送代码到 GitHub 触发自动部署
echo 3. 或使用 WSL/Linux 环境进行本地部署
echo.
pause