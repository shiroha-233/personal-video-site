# Cloudflare 快速部署指南

🚀 **5分钟快速部署到 Cloudflare Pages**

## 准备工作 (1分钟)

```bash
# 1. 安装 Wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 安装项目依赖
npm install --legacy-peer-deps
```

## 数据库设置 (2分钟)

```bash
# 1. 创建 D1 数据库
wrangler d1 create personal-video-site-db

# 2. 复制输出的 database_id 到 wrangler.toml
# 编辑 wrangler.toml，替换 database_id

# 3. 初始化数据库
wrangler d1 execute personal-video-site-db --file=./prisma/migrations/init.sql
```

## 部署应用 (2分钟)

```bash
# 1. 生成 Prisma 客户端
npx prisma generate

# 2. 构建和部署
npm run cf:build
wrangler pages deploy .vercel/output/static --project-name=personal-video-site
```

## 完成！

访问输出的 URL，你的网站就部署成功了！

---

**自动部署设置：**
1. 在 GitHub 仓库设置中添加 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`
2. 推送代码到 `main` 分支即可自动部署

**详细教程：** 查看 [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)