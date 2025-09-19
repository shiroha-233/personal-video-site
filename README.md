# 个人视频资源分享网站 (数据库版)

一个简洁美观的个人视频资源分享平台，采用前后端分离架构 + SQLite 数据库。

## 🚀 重大升级

### ✨ v2.0 数据库版本
- **SQLite 数据库**: 替代 JSON 文件存储
- **实时同步**: 管理后台直接连接数据库
- **RESTful API**: 完整的增删改查接口
- **数据持久化**: 自动备份和恢复
- **性能优化**: 更快的搜索和筛选

## 🚀 快速启动

### 📦 安装和运行
```bash
# 克隆或进入项目目录
cd personal-video-site

# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 导入示例数据
npx tsx migrate-data.ts

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 (或端口自动分配)

### 🎮 管理后台
1. 双击 `admin.html` 文件打开管理后台
2. 或在项目目录中用浏览器打开 `admin.html`
3. 确保客户端应用正在运行 (localhost:3000)

### 📊 数据库管理
```bash
# 查看数据库内容 (图形界面)
npx prisma studio

# 备份数据库
cp prisma/dev.db backup/

# 重置数据库
npx prisma db push --force-reset
```

## 🏗️ 项目架构

### 客户端 (展示端)
- **技术栈**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + Prisma
- **功能**: 纯展示，只读模式，实时数据加载
- **特点**: 响应式设计、动画效果、搜索筛选

### 管理后台 (编辑端)
- **技术栈**: 纯HTML + JavaScript + RESTful API
- **功能**: 视频资源的增删改查，实时同步
- **特点**: 可视化编辑、JSON编辑器、数据导出

### 数据存储
- **数据库**: SQLite (轻量级、无需配置)
- **ORM**: Prisma (类型安全、自动迁移)
- **备份**: 自动备份机制

## 🔄 数据库版使用流程

### 方法一：直接管理 (推荐)
1. 打开 `admin.html` 管理后台
2. 直接编辑视频信息，添加、修改或删除内容
3. 点击“保存视频”，数据立即生效
4. 客户端会实时显示最新内容

### 方法二：数据迁移
```bash
# 从 JSON 文件导入数据到数据库
npx tsx migrate-data.ts

# 查看数据库状态
npx prisma studio

# 备份数据库
cp prisma/dev.db backup/
```

### ⚠️ 重要变化
- **不再需要**: 手动同步 JSON 文件
- **不再需要**: 重启应用才能看到变化
- **实时更新**: 管理后台修改后立即生效
- **数据持久化**: 所有修改都保存在数据库中

## 📁 项目结构

```
personal-video-site/
├── admin.html                    # 管理后台 (独立文件)
├── src/
│   ├── app/                      # Next.js 应用目录
│   │   ├── page.tsx             # 首页
│   │   ├── about/page.tsx       # 关于页面
│   │   └── globals.css          # 全局样式
│   ├── components/              # React 组件
│   │   ├── Header.tsx           # 头部导航
│   │   ├── VideoGrid.tsx        # 视频网格
│   │   ├── VideoCard.tsx        # 视频卡片
│   │   ├── VideoDetailModal.tsx # 详情弹窗
│   │   └── SearchBar.tsx        # 搜索栏
│   ├── data/
│   │   └── videos.json          # 视频数据文件
│   ├── services/
│   │   └── videoService.ts      # 数据服务 (只读)
│   └── types/
│       └── video.ts             # 类型定义
└── public/
    ├── covers/                  # 封面图片目录
    └── uploads/                 # 上传文件目录
```

## 🎨 功能特性

### 客户端功能
- ✅ 响应式视频卡片展示
- ✅ 搜索和标签筛选
- ✅ 详情弹窗显示资源链接
- ✅ 优雅的动画效果
- ✅ 暗色主题支持
- ✅ 移动端优化

### 管理后台功能
- ✅ 可视化视频信息编辑
- ✅ 资源链接管理
- ✅ JSON 数据直接编辑
- ✅ 数据导出功能
- ✅ 实时预览

## 🔧 自定义配置

### 修改网站信息
编辑以下文件中的内容:
- `src/components/Header.tsx` - 网站标题和导航
- `src/app/page.tsx` - 首页标题和描述
- `src/app/about/page.tsx` - 关于页面内容

### 添加新的资源类型
在 `src/types/video.ts` 中修改 Resource 类型的 type 字段:
```typescript
type: 'github' | 'baidu' | 'aliyun' | 'onedrive' | 'other' | 'your-new-type';
```

### 自定义样式
- 修改 `src/app/globals.css` 自定义全局样式
- 使用 Tailwind CSS 类名进行样式调整

## 📋 数据格式

视频数据格式示例:
```json
{
  "id": "1",
  "title": "视频标题",
  "description": "视频描述",
  "coverImage": "/covers/example.jpg",
  "videoUrl": "https://example.com/video",
  "resources": [
    {
      "name": "源代码",
      "type": "github",
      "url": "https://github.com/example/repo",
      "description": "项目源代码"
    }
  ],
  "tags": ["React", "前端"],
  "publishDate": "2024-01-15",
  "duration": "25:30"
}
```

## 🔒 安全注意事项

- 管理后台是本地文件，不要部署到公网
- 定期备份 `videos.json` 数据文件
- 建议使用私有仓库存储项目代码
- 上传文件时注意文件大小和格式

## 📈 扩展建议

- 添加数据库支持 (MySQL, PostgreSQL)
- 集成文件上传功能
- 添加用户认证系统
- 支持批量导入数据
- 添加统计分析功能
- 支持RSS订阅

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License