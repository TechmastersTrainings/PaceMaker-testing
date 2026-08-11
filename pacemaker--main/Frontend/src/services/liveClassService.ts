import apiClient from '@/lib/apiClient';

export interface LiveClassResponse {
  id: number;
  title: string;
  classDateTime: string;
  zoomJoinUrl: string;
  zoomMeetingId: string;
  trainerName?: string;
  topic?: string;
  description?: string;
  autoRecord?: boolean;
  retentionDays?: number;
}

export interface LiveClassRequest {
  title: string;
  classDateTime: string; // ISO LocalDateTime string
  trainerName?: string;
  topic?: string;
  description?: string;
}

export const liveClassService = {
  async getAllLiveClasses(): Promise<LiveClassResponse[]> {
    const { data } = await apiClient.get<LiveClassResponse[]>('/live-classes');
    return data;
  },

  async createLiveClass(request: LiveClassRequest): Promise<LiveClassResponse> {
    const { data } = await apiClient.post<LiveClassResponse>('/live-classes', request);
    return data;
  },

  async updateLiveClass(id: number, request: LiveClassRequest): Promise<LiveClassResponse> {
    const { data } = await apiClient.put<LiveClassResponse>(`/live-classes/${id}`, request);
    return data;
  },

  async deleteLiveClass(id: number): Promise<void> {
    await apiClient.delete(`/live-classes/${id}`);
  }
};
