export interface Resource {
  name: string;
  type: 'github' | 'baidu' | 'aliyun' | 'onedrive' | 'other';
  url: string;
  password?: string;
  description?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  videoUrl?: string;
  resources: Resource[];
  tags: string[];
  publishDate: string;
  duration?: string;
}

export interface VideoFormData {
  title: string;
  description: string;
  coverImage: File | string;
  videoUrl?: string;
  resources: Omit<Resource, 'id'>[];
  tags: string[];
}