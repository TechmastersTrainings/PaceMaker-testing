import apiClient from '@/lib/apiClient';
import axios from 'axios';

// Separate client for endpoints not under /api/v1
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_HOST = process.env.NEXT_PUBLIC_API_URL || 
  (isLocalhost ? 'http://localhost:8080' : 'https://pacemaker-testing-3.onrender.com');
const baseClient = axios.create({
  baseURL: API_HOST.replace(/\/$/, ''),
  timeout: 8000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
});

baseClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalStudents: number;
  totalCourses: number;
  totalExams: number;
  totalVideos: number;
  overallScore: number;
  totalTimeSpent: string;
}

export interface StreakResponse {
  currentStreak: number;
  highestStreak: number;
  lastLoginDate: string;
}

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  earnedAt: string;
}

export interface AchievementResponse {
  id: number;
  name: string;
  description: string;
  achievedAt: string;
}

export interface UserPoints {
  totalPoints: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface SubjectPerformance {
  subjectId: number;
  subjectName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

// ── Empty defaults (returned when backend is unavailable) ─────────────────────
function emptyAnalytics(): AnalyticsSummary {
  return {
    totalStudents: 0,
    totalCourses: 0,
    totalExams: 0,
    totalVideos: 0,
    overallScore: 0,
    totalTimeSpent: '0h',
  };
}

function emptyStreak(): StreakResponse {
  return {
    currentStreak: 0,
    highestStreak: 0,
    lastLoginDate: new Date().toISOString(),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────
export const dashboardService = {

  async getDashboardSummary(): Promise<AnalyticsSummary> {
    try {
      const { data } = await baseClient.get<AnalyticsSummary>('/api/dashboard/summary');
      return data;
    } catch {
      return emptyAnalytics();
    }
  },

  async getStudentAnalytics(): Promise<AnalyticsSummary> {
    try {
      const { data } = await baseClient.get<AnalyticsSummary>('/api/analytics/student');
      return data;
    } catch {
      return emptyAnalytics();
    }
  },

  async getSubjectPerformance(subjectId: number): Promise<SubjectPerformance> {
    try {
      const { data } = await baseClient.get<SubjectPerformance>(`/api/analytics/subject/${subjectId}`);
      return data;
    } catch {
      return { subjectId, subjectName: '', score: 0, correctAnswers: 0, totalQuestions: 0 };
    }
  },

  async getStreak(): Promise<StreakResponse> {
    try {
      const { data } = await baseClient.get<StreakResponse>('/api/gamification/streak');
      return data;
    } catch {
      return emptyStreak();
    }
  },

  async getUserBadges(): Promise<BadgeResponse[]> {
    try {
      const { data } = await baseClient.get<BadgeResponse[]>('/api/gamification/badges');
      return data;
    } catch {
      return [];
    }
  },

  async getUserPoints(): Promise<UserPoints> {
    try {
      const { data } = await baseClient.get<UserPoints>('/api/gamification/points');
      return data;
    } catch {
      return { totalPoints: 0, totalQuestions: 0, correctAnswers: 0 };
    }
  },

  async getUserAchievements(): Promise<AchievementResponse[]> {
    try {
      const { data } = await baseClient.get<AchievementResponse[]>('/api/gamification/achievements');
      return data;
    } catch {
      return [];
    }
  },

  async recordDailyLogin(): Promise<StreakResponse> {
    try {
      const { data } = await baseClient.post<StreakResponse>('/api/gamification/login');
      return data;
    } catch {
      return emptyStreak();
    }
  },
};
