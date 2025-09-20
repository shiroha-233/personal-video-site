# Cloudflare Pages 部署指南

## 🚀 部署前准备

### 1. 项目优化
项目已针对 Cloudflare Pages 进行了以下优化：

#### 图片处理优化
- ✅ 增强的图片代理 API (`/api/proxy-image`)
- ✅ 智能域名检测和代理
- ✅ 错误处理和占位图片
- ✅ 缓存优化配置

#### 配置文件更新
- ✅ `next.config.ts` - 添加图片域名配置和安全头
- ✅ `wrangler.toml` - 优化缓存策略
- ✅ 新增图片处理工具库 (`src/lib/imageUtils.ts`)

## 📋 部署步骤

### 1. 推送代码到 GitHub
```bash
git add .
git commit -m "优化 Cloudflare Pages 部署配置"
git push origin main
```

### 2. 在 Cloudflare Pages 中创建项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 连接你的 GitHub 仓库
5. 选择 `personal-video-site` 仓库

### 3. 配置构建设置
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (留空)
```

### 4. 环境变量设置
在 Cloudflare Pages 项目设置中添加：
```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-project.pages.dev
```

## 🔧 图片加载问题解决方案

### 问题分析
Cloudflare Pages 部署后图片无法加载的主要原因：
1. **跨域限制** - B站、YouTube 等平台的防盗链机制
2. **Referer 检查** - 图片服务器验证请求来源
3. **Edge Runtime 限制** - 某些 Node.js API 在边缘环境中不可用

### 解决方案
1. **图片代理服务** (`/api/proxy-image`)
   - 自动检测需要代理的域名
   - 设置正确的 Referer 和 User-Agent
   - 处理超时和错误情况
   - 返回 SVG 占位图片

2. **智能回退机制**
   - 图片加载失败时显示占位图片
   - 支持多种错误状态的可视化反馈

3. **缓存优化**
   - 图片代理结果缓存 24 小时
   - 静态资源缓存 1 年
   - 边缘缓存配置

## 🧪 测试和调试

### 1. 图片代理测试
访问测试端点检查图片可访问性：
```
https://your-site.pages.dev/api/test-image?url=图片URL
```

### 2. 健康检查
访问健康检查端点：
```
https://your-site.pages.dev/api/health
```

### 3. 常见问题排查

#### 图片仍然无法加载
1. 检查图片 URL 是否正确
2. 确认代理 API 是否正常工作
3. 查看浏览器开发者工具的网络面板

#### API 响应慢
1. 检查 Cloudflare 缓存设置
2. 确认图片源服务器响应时间
3. 考虑使用 CDN 或图床服务

## 📊 性能优化建议

### 1. 图片优化
- 使用 WebP 格式图片
- 压缩图片大小
- 考虑使用专业图床服务

### 2. 缓存策略
- 静态资源设置长期缓存
- API 响应设置适当缓存时间
- 利用 Cloudflare 的边缘缓存

### 3. 监控和分析
- 使用 Cloudflare Analytics 监控性能
- 设置错误日志收集
- 定期检查图片加载成功率

## 🔒 安全考虑

### 1. 图片代理安全
- 限制代理的域名范围
- 设置请求超时时间
- 验证图片文件类型和大小

### 2. CORS 配置
- 正确设置跨域请求头
- 限制允许的请求方法

### 3. 内容安全
- 设置 CSP 头部
- 防止 XSS 攻击
- 验证用户输入

## 📝 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 图片能够正常加载
- [ ] 搜索功能正常
- [ ] 管理后台可以访问（如果部署）
- [ ] API 端点响应正常
- [ ] 移动端显示正常
- [ ] 性能指标良好

## 🆘 故障排除

### 常见错误及解决方案

1. **构建失败**
   ```bash
   # 检查依赖版本兼容性
   npm install --legacy-peer-deps
   ```

2. **图片代理 500 错误**
   - 检查目标图片 URL 是否有效
   - 确认网络连接正常
   - 查看 Cloudflare 函数日志

3. **API 超时**
   - 减少超时时间设置
   - 优化代码逻辑
   - 使用异步处理

## 📞 技术支持

如果遇到问题，可以：
1. 查看 Cloudflare Pages 的构建日志
2. 检查浏览器开发者工具
3. 参考 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
4. 在项目 GitHub 仓库提交 Issue

---

**注意**: 部署完成后，建议等待 5-10 分钟让 DNS 和缓存完全生效。