# Cloudflare Pages 部署问题解决指南

## 问题诊断

### 1. 检查部署状态
访问 `/api/health` 端点查看系统状态：
```
https://your-site.pages.dev/api/health
```

### 2. 常见错误及解决方案

#### 错误：API 路由返回 500 状态码
**原因：** Edge Runtime 环境限制
**解决方案：**
1. 检查 `wrangler.toml` 配置
2. 确保所有 API 路由都使用 `export const runtime = 'edge'`
3. 避免使用 Node.js 特定的 API

#### 错误：图片无法加载 (CORS)
**原因：** 跨域资源共享限制
**解决方案：**
1. 使用图片代理 API (`/api/proxy-image`)
2. 添加适当的 CORS 头部
3. 使用 `ImageWithFallback` 组件

#### 错误：数据获取失败
**原因：** 静态文件访问限制
**解决方案：**
1. 确保 `public/videos.json` 文件存在
2. 检查环境变量配置
3. 使用内存存储作为后备

## 部署配置

### 1. 环境变量设置
在 Cloudflare Pages 控制台设置：
```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-site.pages.dev
```

### 2. 构建命令
```bash
npm install --legacy-peer-deps && npm run build && npx @cloudflare/next-on-pages
```

### 3. 输出目录
```
.vercel/output/static
```

## 性能优化

### 1. 图片优化
- 使用 WebP 格式
- 启用图片代理缓存
- 设置适当的缓存头部

### 2. API 优化
- 减少外部 API 调用
- 实现请求超时
- 添加错误重试机制

### 3. 缓存策略
```javascript
// API 响应缓存
'Cache-Control': 'public, max-age=86400'

// 静态资源缓存
'Cache-Control': 'public, max-age=31536000'
```

## 故障排除

### 1. 检查日志
在 Cloudflare Pages 控制台查看：
- 构建日志
- 函数日志
- 实时日志

### 2. 本地测试
```bash
# 本地开发
npm run dev

# 本地构建测试
npm run build
npm start
```

### 3. 边缘函数调试
```bash
# 使用 Wrangler 本地测试
npx wrangler pages dev .vercel/output/static
```

## 监控和维护

### 1. 健康检查
定期访问 `/api/health` 检查系统状态

### 2. 性能监控
- 使用 Cloudflare Analytics
- 监控 API 响应时间
- 跟踪错误率

### 3. 更新策略
- 定期更新依赖
- 测试新的 Cloudflare 功能
- 优化边缘函数性能

## 联系支持

如果问题持续存在：
1. 检查 Cloudflare Pages 状态页面
2. 查看 Next.js 和 Cloudflare 文档
3. 在项目 GitHub 仓库提交 Issue