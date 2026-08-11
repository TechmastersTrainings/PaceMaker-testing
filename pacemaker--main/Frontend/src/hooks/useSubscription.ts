'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export type PlanType = 'BASIC' | 'MEDIUM' | 'HIGH' | null;
export type FeatureKey =
  | 'dashboard'
  | 'videos'
  | 'live'
  | 'study-material'
  | 'qbank'
  | 'exams'
  | 'patient-simulation'
  | 'performance'
  | 'leaderboard'
  | 'achievements'
  | 'revision-videos'
  | 'mcq-discussions'
  | 'notes'
  | 'flowcharts'
  | 'clinical-images'
  | 'revision-tools'
  | 'analytics';

interface SubscriptionInfo {
  plan: PlanType;
  status: string;
  expiryDate: string | null;
  qbankAccess: boolean;
  videoAccess: boolean;
  liveClassAccess: boolean;
  aiAccess: boolean;
}

const NO_SUB: SubscriptionInfo = {
  plan: null,
  status: 'NONE',
  expiryDate: null,
  qbankAccess: false,
  videoAccess: false,
  liveClassAccess: false,
  aiAccess: false,
};

const FEATURE_MAP: Record<string, Record<FeatureKey, boolean>> = {
  NONE: {
    dashboard: true,
    videos: false, live: false, 'study-material': false,
    qbank: false, exams: false, 'patient-simulation': false,
    performance: false, leaderboard: false, achievements: false,
    'revision-videos': false, 'mcq-discussions': false,
    notes: false, flowcharts: false, 'clinical-images': false,
    'revision-tools': false, analytics: false,
  },
  BASIC: {
    dashboard: true, videos: false, live: false, 'study-material': false,
    qbank: false, exams: true, 'patient-simulation': false,
    performance: false, leaderboard: false, achievements: false,
    'revision-videos': false, 'mcq-discussions': false,
    notes: false, flowcharts: false, 'clinical-images': false,
    'revision-tools': false, analytics: false,
  },
  MEDIUM: {
    dashboard: true, videos: false, live: false, 'study-material': false,
    qbank: true, exams: true, 'patient-simulation': false,
    performance: true, leaderboard: true, achievements: false,
    'revision-videos': false, 'mcq-discussions': false,
    notes: false, flowcharts: false, 'clinical-images': false,
    'revision-tools': false, analytics: false,
  },
  HIGH: {
    dashboard: true, videos: true, live: true, 'study-material': true,
    qbank: true, exams: true, 'patient-simulation': true,
    performance: true, leaderboard: true, achievements: true,
    'revision-videos': true, 'mcq-discussions': true,
    notes: true, flowcharts: true, 'clinical-images': true,
    'revision-tools': true, analytics: true,
  },
};

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionInfo>(NO_SUB);
  const [loading, setLoading] = useState(true);

  function loadFromLocalStorage(): SubscriptionInfo | null {
    const cached = localStorage.getItem('lms_subscription_fallback');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    const raw = localStorage.getItem('lms_subscriptions_v2');
    if (raw) {
      try {
        const subs = JSON.parse(raw);
        const email = localStorage.getItem('currentUserEmail') || '';
        const match = subs.find((s: any) => s.email?.toLowerCase() === email.toLowerCase() && s.status === 'Active');
        if (match) {
          const planMap: Record<string, PlanType> = { Basic: 'BASIC', Medium: 'MEDIUM', High: 'HIGH', Enterprise: 'HIGH' };
          return {
            plan: planMap[match.plan] || 'BASIC',
            status: 'ACTIVE',
            expiryDate: match.endDate || null,
            qbankAccess: true,
            videoAccess: match.plan === 'High' || match.plan === 'Enterprise',
            liveClassAccess: match.plan === 'High' || match.plan === 'Enterprise',
            aiAccess: match.plan === 'High' || match.plan === 'Enterprise',
          };
        }
      } catch { /* ignore */ }
    }
    return null;
  }

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        const res = await apiClient.get('/user/subscription');
        const data = res.data as any;
        if (!cancelled) {
          if (data.plan) {
            setSub({
              plan: data.plan || null,
              status: data.status || 'NONE',
              expiryDate: data.expiryDate || null,
              qbankAccess: !!data.qbankAccess,
              videoAccess: !!data.videoAccess,
              liveClassAccess: !!data.liveClassAccess,
              aiAccess: !!data.aiAccess,
            });
          } else {
            const local = loadFromLocalStorage();
            if (local) setSub(local);
          }
        }
      } catch {
        if (!cancelled) {
          const local = loadFromLocalStorage();
          if (local) setSub(local);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const isAdminOrInstructor = userRole === 'admin' || userRole === 'instructor' || userRole === 'superadmin' || userRole === 'trainer';

  const planKey = sub.plan || 'NONE';
  const features = FEATURE_MAP[planKey] || FEATURE_MAP.NONE;

  const isActive = sub.status === 'ACTIVE' || sub.status === 'Active';

  const canAccess = (feature: FeatureKey): boolean => {
    if (isAdminOrInstructor) return true;
    if (!isActive) return features[feature];
    return features[feature];
  };
  const hasPlan = isAdminOrInstructor || (sub.plan !== null && isActive);
  const isPro = isAdminOrInstructor || (isActive && (sub.plan === 'MEDIUM' || sub.plan === 'HIGH'));

  return { sub, loading, canAccess, hasPlan, isPro, features };
}

export type { SubscriptionInfo };
