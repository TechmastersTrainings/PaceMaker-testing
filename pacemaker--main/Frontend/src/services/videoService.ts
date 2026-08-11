import apiClient from '@/lib/apiClient';

export interface VideoResponse {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  accessLevel: string;
  category: string;
  tags?: string;
  subject?: string;
  assetId?: string;
  uploadUrl?: string;
  instructor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoCategoryProgress {
  category: string;
  totalVideos: number;
  completedVideos: number;
  progressPercentage: number;
}

export const videoService = {
  async getAllVideos(): Promise<VideoResponse[]> {
    const { data } = await apiClient.get<VideoResponse[]>('/videos');
    return data;
  },

  async getVideoById(id: number): Promise<VideoResponse> {
    const { data } = await apiClient.get<VideoResponse>(`/videos/${id}`);
    return data;
  },

  async uploadVideo(formData: FormData): Promise<VideoResponse> {
    const { data } = await apiClient.post<VideoResponse>('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000
    });
    return data;
  },

  async updateVideo(id: number, data: {
    title?: string;
    description?: string;
    category?: string;
    accessLevel?: string;
    tags?: string;
    subject?: string;
    instructor?: string;
  }): Promise<VideoResponse> {
    const params = new URLSearchParams();
    if (data.title !== undefined) params.append('title', data.title);
    if (data.description !== undefined) params.append('description', data.description);
    if (data.category !== undefined) params.append('category', data.category);
    if (data.accessLevel !== undefined) params.append('accessLevel', data.accessLevel);
    if (data.tags !== undefined) params.append('tags', data.tags);
    if (data.subject !== undefined) params.append('subject', data.subject);
    if (data.instructor !== undefined) params.append('instructor', data.instructor);
    const { data: response } = await apiClient.put<VideoResponse>(`/videos/${id}`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response;
  },

  async deleteVideo(id: number): Promise<void> {
    await apiClient.delete(`/videos/${id}`);
  },

  async getCategoryProgress(): Promise<VideoCategoryProgress[]> {
    const { data } = await apiClient.get<VideoCategoryProgress[]>('/videos/progress');
    return data;
  },

  async markComplete(videoId: number): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(`/videos/${videoId}/complete`);
    return data;
  },

  async getResume(videoId: number): Promise<{ videoId: number; resumeAt: number; completed: boolean }> {
    const { data } = await apiClient.get<{ videoId: number; resumeAt: number; completed: boolean }>(`/videos/${videoId}/resume`);
    return data;
  }
};
