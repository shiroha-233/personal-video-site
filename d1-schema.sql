-- 创建视频表
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    coverImage TEXT NOT NULL,
    videoUrl TEXT,
    duration TEXT,
    publishDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建资源表
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    password TEXT,
    description TEXT,
    videoId TEXT NOT NULL,
    FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 创建视频标签关联表
CREATE TABLE IF NOT EXISTS video_tags (
    videoId TEXT NOT NULL,
    tagId TEXT NOT NULL,
    PRIMARY KEY (videoId, tagId),
    FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_videos_publishDate ON videos(publishDate DESC);
CREATE INDEX IF NOT EXISTS idx_resources_videoId ON resources(videoId);
CREATE INDEX IF NOT EXISTS idx_video_tags_videoId ON video_tags(videoId);
CREATE INDEX IF NOT EXISTS idx_video_tags_tagId ON video_tags(tagId);