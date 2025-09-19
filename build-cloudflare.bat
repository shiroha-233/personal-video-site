@echo off
echo Building for Cloudflare Pages on Windows...

REM 清理之前的构建文件
if exist ".vercel" (
    echo Cleaning previous build...
    rmdir /s /q .vercel
)

REM 设置环境变量
set NODE_OPTIONS=--max-old-space-size=8192
set FORCE_COLOR=1

REM 首先进行 Next.js 构建
echo Step 1: Building Next.js application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Next.js build failed!
    exit /b %ERRORLEVEL%
)

REM 然后进行 Cloudflare 适配
echo Step 2: Adapting for Cloudflare Pages...
call npx @cloudflare/next-on-pages --skip-build

if %ERRORLEVEL% NEQ 0 (
    echo Cloudflare adaptation failed!
    exit /b %ERRORLEVEL%
)

echo Build completed successfully!
echo Output directory: .vercel/output/static