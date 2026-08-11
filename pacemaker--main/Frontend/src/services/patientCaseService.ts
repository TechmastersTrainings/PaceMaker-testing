import apiClient from '@/lib/apiClient';

export interface PatientCase {
  id: number;
  name: string;
  description: string;
  difficulty: string; // 'Medium' | 'Advanced' | etc.
  systemSubject: string; // e.g. 'chest_pain', 'abdominal_pain'
}

export const patientCaseService = {
  async getAllCases(): Promise<PatientCase[]> {
    const { data } = await apiClient.get<PatientCase[]>('/patient-cases');
    return data;
  },

  async getCaseById(id: number): Promise<PatientCase> {
    const { data } = await apiClient.get<PatientCase>(`/patient-cases/${id}`);
    return data;
  },

  async createCase(caseData: Omit<PatientCase, 'id'>): Promise<PatientCase> {
    const { data } = await apiClient.post<PatientCase>('/patient-cases', caseData);
    return data;
  },

  async updateCase(id: number, caseData: Partial<PatientCase>): Promise<PatientCase> {
    const { data } = await apiClient.put<PatientCase>(`/patient-cases/${id}`, caseData);
    return data;
  },

  async deleteCase(id: number): Promise<void> {
    await apiClient.delete(`/patient-cases/${id}`);
  }
};
