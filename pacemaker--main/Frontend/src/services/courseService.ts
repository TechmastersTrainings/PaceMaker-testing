import apiClient from '@/lib/apiClient';

export interface Course {
  id: number;
  courseName: string;
  description: string;
  subject: string;
  level: string;
  lectureCount: number;
  thumbnailUrl: string;
  active: boolean;
  createdAt: string;
}

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const { data } = await apiClient.get<Course[]>('/courses');
    return data ?? [];
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const { data } = await apiClient.post<Course>('/courses', course);
    return data;
  }
};
