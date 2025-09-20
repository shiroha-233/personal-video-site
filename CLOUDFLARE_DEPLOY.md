# Cloudflare Pages 部署指南

本指南将帮助你将个人视频网站部署到 Cloudflare Pages 平台。

## 🚀 部署概述

此项目支持通过以下方式部署到 Cloudflare Pages：
1. **自动部署** - 通过 GitHub Actions CI/CD (推荐)
2. **手动部署** - 通过 Wrangler CLI 工具 (Linux/WSL)

## ⚠️ Windows 用户注意

由于 `@cloudflare/next-on-pages` 在 Windows 环境下存在兼容性问题，**强烈推荐使用 GitHub Actions 进行自动部署**。如需本地部署，请使用 WSL (Windows Subsystem for Linux)。

## 📋 前置要求

### 必需账户和工具
- [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org/) >= 18.x
- [Git](https://git-scm.com/)
- [GitHub 账户](https://github.com/) (用于自动部署)

### 安装 Wrangler CLI
```bash
npm install -g wrangler@latest
# 或者
npm install wrangler@latest --save-dev
```

## 🛠️ 第一步：环境准备

### 1. 安装项目依赖
```bash
# 进入项目目录
cd personal-video-site

# 安装依赖 (注意使用 legacy-peer-deps)
npm install --legacy-peer-deps
```

### 2. 登录 Cloudflare
```bash
wrangler login
```
这将打开浏览器，登录你的 Cloudflare 账户并授权 Wrangler。

### 3. 创建 D1 数据库
```bash
# 创建 D1 数据库
wrangler d1 create personal-video-site-db

# 记录输出的 database_id，你需要更新 wrangler.toml
```

输出示例：
```
✅ Successfully created DB 'personal-video-site-db' in region APAC
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB"
database_name = "personal-video-site-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. 更新配置文件

编辑 `wrangler.toml`，将 `database_id` 替换为实际值：
```toml
[[d1_databases]]
binding = "DB"
database_name = "personal-video-site-db"
database_id = "你的实际database-id"  # 替换这里
```

## 📊 第二步：数据库配置

### 1. 初始化 D1 数据库结构
```bash
# 创建数据库表结构
wrangler d1 execute personal-video-site-db --file=./prisma/migrations/init.sql
```

### 2. 生成 Prisma 客户端
```bash
npx prisma generate
```

### 3. 导入示例数据 (可选)
如果你已有本地数据，可以导出并导入到 D1：
```bash
# 先导出本地数据
npx tsx migrate-data.ts

# 手动导入数据到 D1 (需要转换为 SQL 语句)
```

## 🚀 第三步：部署应用

### 方法 A：手动部署

```bash
# 构建应用
npm run cf:build

# 部署到 Cloudflare Pages
npm run pages:deploy

# 或直接使用 wrangler
wrangler pages deploy .vercel/output/static --project-name=personal-video-site
```

### 方法 B：自动部署 (推荐)

#### 1. 设置 GitHub Secrets
在你的 GitHub 仓库中，进入 `Settings` -> `Secrets and variables` -> `Actions`，添加以下 secrets：

- `CLOUDFLARE_API_TOKEN`: 你的 Cloudflare API Token
  - 在 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) 创建
  - 使用 "Custom token" 模板
  - 权限：`Zone:Zone:Read`, `Zone:DNS:Edit`, `Zone:Zone Settings:Edit`, `Account:Cloudflare Pages:Edit`

- `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare Account ID
  - 在 Cloudflare Dashboard 右侧边栏可以找到

#### 2. 推送代码触发自动部署
```bash
git add .
git commit -m "feat: 配置 Cloudflare Pages 部署"
git push origin main
```

GitHub Actions 将自动：
1. 安装依赖
2. 生成 Prisma 客户端
3. 构建应用
4. 部署到 Cloudflare Pages

## 🔧 第四步：配置自定义域名 (可选)

### 1. 在 Cloudflare Dashboard 中配置
1. 进入 [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. 选择你的项目 `personal-video-site`
3. 进入 `Custom domains` 选项卡
4. 添加你的域名

### 2. 更新 DNS 记录
确保你的域名的 DNS 记录指向 Cloudflare Pages：
```
CNAME your-domain.com your-project.pages.dev
```

## 🗂️ 第五步：数据管理

### 查看 D1 数据库
```bash
# 列出数据库中的表
wrangler d1 execute personal-video-site-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# 查看视频数据
wrangler d1 execute personal-video-site-db --command="SELECT * FROM Video LIMIT 10;"
```

### 备份数据
```bash
# 导出数据库
wrangler d1 export personal-video-site-db --output=backup.sql
```

### 在线管理数据库
访问 [Cloudflare Dashboard D1](https://dash.cloudflare.com/d1) 可以在线查看和编辑数据。

## ⚙️ 环境变量配置

在 Cloudflare Pages 项目设置中配置以下环境变量：

### 生产环境变量
- `DATABASE_URL`: `your-d1-connection-string`
- `NODE_ENV`: `production`
- `ENVIRONMENT`: `production`

## 🔍 故障排除

### 常见问题

#### 1. 构建失败：Next.js 版本兼容性
```
Error: @cloudflare/next-on-pages only supports Next.js versions >=14.3.0 and <=15.5.2
```

**解决方案：**
```bash
# 降级 Next.js 版本
npm install next@15.5.2 --legacy-peer-deps
```

#### 2. Prisma 适配器问题
如果遇到 `@prisma/adapter-d1` 相关错误：
```bash
# 确保安装了正确版本
npm install @prisma/adapter-d1@latest --legacy-peer-deps
```

#### 3. 数据库连接失败
检查 `wrangler.toml` 中的 `database_id` 是否正确。

#### 4. 部署后页面空白
确保：
- 构建输出目录正确：`.vercel/output/static`
- Next.js 配置中启用了静态导出：`output: 'export'`

### 检查部署状态
```bash
# 查看部署日志
wrangler pages deployment tail

# 查看项目状态
wrangler pages project list
```

## 📚 更多资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 获取帮助

如果遇到问题，可以：
1. 查看 [GitHub Issues](https://github.com/your-username/personal-video-site/issues)
2. 在 [Cloudflare Community](https://community.cloudflare.com/) 寻求帮助
3. 参考项目的 [README.md](./README.md) 获取更多信息

---

**注意：** 部署到 Cloudflare Pages 后，管理后台 (`admin.html`) 将无法直接访问数据库。建议通过 API 接口或 Cloudflare Dashboard 管理数据。