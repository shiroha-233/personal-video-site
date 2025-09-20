-- 清理现有数据
DELETE FROM video_tags;
DELETE FROM resources;
DELETE FROM tags;
DELETE FROM videos;

-- 插入示例视频
INSERT INTO videos (id, title, description, coverImage, videoUrl, duration, publishDate, createdAt, updatedAt) 
VALUES 
  ('example-1', '个人视频网站部署教程', '使用 Next.js + Cloudflare Pages 构建个人视频资源分享网站的完整教程。

本教程包含:
1. Next.js 项目搭建
2. Cloudflare Pages 部署
3. D1 数据库配置
4. 图片代理实现', 'https://via.placeholder.com/480x270/6366f1/ffffff?text=Video+Tutorial', 'https://www.bilibili.com/video/BV1234567890', '25:30', '2024-01-20', datetime('now'), datetime('now')),
  
  ('example-2', '前端开发工具推荐', '分享一些前端开发中常用的工具和插件，提高开发效率。

包含:
1. VS Code 插件推荐
2. Chrome 开发者工具技巧
3. 在线工具合集', 'https://via.placeholder.com/480x270/f59e0b/ffffff?text=Dev+Tools', 'https://www.bilibili.com/video/BV9876543210', '18:45', '2024-01-15', datetime('now'), datetime('now'));

-- 插入标签
INSERT INTO tags (id, name, createdAt) 
VALUES 
  ('tag-1', 'Next.js', datetime('now')),
  ('tag-2', 'Cloudflare', datetime('now')),
  ('tag-3', '教程', datetime('now')),
  ('tag-4', '部署', datetime('now')),
  ('tag-5', '前端', datetime('now')),
  ('tag-6', '工具', datetime('now')),
  ('tag-7', '效率', datetime('now')),
  ('tag-8', 'VS Code', datetime('now'));

-- 插入资源
INSERT INTO resources (id, name, type, url, password, description, videoId) 
VALUES 
  ('res-1', '项目源码', 'github', 'https://github.com/shiroha-233/personal-video-site', NULL, '完整的项目源代码', 'example-1'),
  ('res-2', '部署文档', 'other', 'https://github.com/shiroha-233/personal-video-site/blob/main/README.md', NULL, '详细的部署说明', 'example-1'),
  ('res-3', '工具清单', 'other', 'https://github.com/shiroha-233/frontend-tools', NULL, '前端开发工具清单', 'example-2'),
  ('res-4', '配置文件', 'github', 'https://github.com/shiroha-233/vscode-config', NULL, 'VS Code 配置文件', 'example-2');

-- 插入视频标签关联
INSERT INTO video_tags (id, videoId, tagId) 
VALUES 
  ('vt-1', 'example-1', 'tag-1'),
  ('vt-2', 'example-1', 'tag-2'),
  ('vt-3', 'example-1', 'tag-3'),
  ('vt-4', 'example-1', 'tag-4'),
  ('vt-5', 'example-2', 'tag-5'),
  ('vt-6', 'example-2', 'tag-6'),
  ('vt-7', 'example-2', 'tag-7'),
  ('vt-8', 'example-2', 'tag-8');