import { Video } from '@/types/video';
import { prisma } from '@/lib/prisma';

// 辅助函数：将数据库数据转换为应用类型
function transformVideo(video: any): Video {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    coverImage: video.coverImage,
    videoUrl: video.videoUrl || undefined,
    duration: video.duration || undefined,
    publishDate: video.publishDate.toISOString().split('T')[0],
    resources: video.resources.map((resource: any) => ({
      name: resource.name,
      type: resource.type,
      url: resource.url,
      password: resource.password || undefined,
      description: resource.description || undefined
    })),
    tags: video.tags.map((vt: any) => vt.tag.name)
  };
}

// 数据库服务 - 支持完整的 CRUD 操作
export const videoService = {
  // 获取所有视频
  getAllVideos: async (): Promise<Video[]> => {
    try {
      const videos = await prisma.video.findMany({
        include: {
          resources: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          publishDate: 'desc'
        }
      });

      return videos.map(transformVideo);
    } catch (error) {
      console.error('获取视频失败:', error);
      return [];
    }
  },

  // 根据 ID 获取视频
  getVideoById: async (id: string): Promise<Video | null> => {
    try {
      const video = await prisma.video.findUnique({
        where: { id },
        include: {
          resources: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!video) return null;
      return transformVideo(video);
    } catch (error) {
      console.error('获取视频失败:', error);
      return null;
    }
  },

  // 根据标签筛选视频
  getVideosByTag: async (tag: string): Promise<Video[]> => {
    try {
      const videos = await prisma.video.findMany({
        where: {
          tags: {
            some: {
              tag: {
                name: {
                  contains: tag,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        include: {
          resources: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          publishDate: 'desc'
        }
      });

      return videos.map(transformVideo);
    } catch (error) {
      console.error('筛选视频失败:', error);
      return [];
    }
  },

  // 搜索视频
  searchVideos: async (query: string): Promise<Video[]> => {
    try {
      const videos = await prisma.video.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              tags: {
                some: {
                  tag: {
                    name: {
                      contains: query,
                      mode: 'insensitive'
                    }
                  }
                }
              }
            }
          ]
        },
        include: {
          resources: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          publishDate: 'desc'
        }
      });

      return videos.map(transformVideo);
    } catch (error) {
      console.error('搜索视频失败:', error);
      return [];
    }
  },

  // 获取所有标签
  getAllTags: async (): Promise<string[]> => {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      return tags.map((tag: any) => tag.name);
    } catch (error) {
      console.error('获取标签失败:', error);
      return [];
    }
  }
};