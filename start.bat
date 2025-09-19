@echo off
echo.
echo ===================================
echo    视频资源分享网站快速启动
echo ===================================
echo.

echo 🚀 启动客户端应用...
echo 访问地址: http://localhost:3000
echo.
echo 💡 提示:
echo   - 要管理内容，请打开 admin.html
echo   - 要查看数据，运行: node sync-data.js show
echo   - 要同步数据，运行: node sync-data.js update [文件路径]
echo.
echo 按 Ctrl+C 停止服务器
echo.

cd /d "%~dp0"
npm run dev

pause