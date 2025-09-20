# GitHub Secrets 配置指南

为了实现自动化部署到Cloudflare Pages，您需要在GitHub仓库中配置以下Secrets：

## 🔑 必需的GitHub Secrets

### 1. CLOUDFLARE_API_TOKEN
**获取步骤：**
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 选择 "Custom token"
4. 配置以下权限：
   - `Cloudflare Pages:Edit` - 管理Pages项目和部署
   - `Zone:Zone:Read` - 读取域名区域信息
   - `Account:D1:Edit` - 管理D1数据库

**Account Resources:** 选择您的Cloudflare账户

### 2. CLOUDFLARE_ACCOUNT_ID
**获取步骤：**
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在右侧边栏找到 "Account ID"
3. 复制该ID值

## ⚙️ 配置GitHub Secrets

### 在GitHub仓库中配置：
1. 进入您的GitHub仓库: `https://github.com/shiroha-233/personal-video-site`
2. 点击 `Settings` -> `Secrets and variables` -> `Actions`
3. 点击 `New repository secret`
4. 添加以下两个secrets：
   - Name: `CLOUDFLARE_API_TOKEN`, Value: 您的API Token
   - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: 您的Account ID

## 🚀 触发部署

配置完成后，推送代码到main分支即可触发自动部署：

```bash
git add .
git commit -m "feat: 触发Cloudflare自动部署"
git push origin main
```

## 📊 部署状态检查

部署完成后，您可以通过以下方式检查：

1. **GitHub Actions**: 在仓库的 "Actions" 标签查看构建日志
2. **Cloudflare Dashboard**: 访问 [Cloudflare Pages](https://dash.cloudflare.com/pages) 查看部署状态
3. **访问网站**: `https://personal-video-site.pages.dev`

## 🔧 故障排除

如果部署失败，请检查：
1. API Token权限是否正确
2. Account ID是否准确
3. GitHub Actions日志中的错误信息

## 📝 注意事项

- 确保API Token具有足够的权限
- Account ID可以在Cloudflare Dashboard右侧找到
- 首次部署可能需要几分钟才能完全生效