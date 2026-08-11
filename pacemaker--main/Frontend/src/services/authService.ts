import apiClient from '@/lib/apiClient';

export interface AuthResponse {
  token: string;
  name: string;
  role: string;
  currentYear?: number | null;
  academicLevelId?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: string;
  currentYear?: number | null;
  academicLevelId?: string;
  specialization?: string;
  subSpecialization?: string;
  qualification?: string;
  college?: string;
  graduationYear?: string;
  experience?: string;
  designation?: string;
  hospital?: string;
  teachingExperience?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  altPhone?: string;
  address?: string;
  medicalCertName?: string;
  aadharCardName?: string;
  cvName?: string;
}



function persist(data: AuthResponse, email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', data.token);
  localStorage.setItem('currentUser', data.name);
  localStorage.setItem('userRole', data.role.toLowerCase());
  localStorage.setItem('currentUserEmail', email);
  if (data.currentYear != null) {
    localStorage.setItem('currentYear', String(data.currentYear));
  } else {
    localStorage.removeItem('currentYear');
  }
  if (data.academicLevelId) {
    localStorage.setItem('academicLevelId', data.academicLevelId);
  } else {
    localStorage.removeItem('academicLevelId');
  }
}

// ── Service ──────────────────────────────────────────────────────────────────
export const authService = {

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    persist(data, payload.email);
    return data;
  },
  async register(payload: RegisterRequest): Promise<string> {
    const { data } = await apiClient.post<string>('/auth/register', {
      ...payload,
      username: payload.email,
    });
    return data;
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentYear');
    localStorage.removeItem('academicLevelId');
    window.location.href = '/login';
  }
};
