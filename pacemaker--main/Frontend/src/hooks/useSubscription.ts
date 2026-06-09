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
  | 'achievements';

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
  },
  BASIC: {
    dashboard: true, videos: false, live: false, 'study-material': false,
    qbank: false, exams: true, 'patient-simulation': false,
    performance: false, leaderboard: false, achievements: false,
  },
  MEDIUM: {
    dashboard: true, videos: false, live: false, 'study-material': false,
    qbank: true, exams: true, 'patient-simulation': false,
    performance: true, leaderboard: true, achievements: false,
  },
  HIGH: {
    dashboard: true, videos: true, live: true, 'study-material': true,
    qbank: true, exams: true, 'patient-simulation': true,
    performance: true, leaderboard: true, achievements: true,
  },
};

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionInfo>(NO_SUB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        const res = await apiClient.get('/user/subscription');
        const data = res.data as any;
        if (!cancelled) {
          setSub({
            plan: data.plan || null,
            status: data.status || 'NONE',
            expiryDate: data.expiryDate || null,
            qbankAccess: !!data.qbankAccess,
            videoAccess: !!data.videoAccess,
            liveClassAccess: !!data.liveClassAccess,
            aiAccess: !!data.aiAccess,
          });
        }
      } catch {
        const cached = localStorage.getItem('lms_subscription_fallback');
        if (cached && !cancelled) {
          try { setSub(JSON.parse(cached)); } catch { /* ignore */ }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const planKey = sub.plan || 'NONE';
  const features = FEATURE_MAP[planKey] || FEATURE_MAP.NONE;

  const canAccess = (feature: FeatureKey): boolean => features[feature];
  const hasPlan = sub.plan !== null && sub.status === 'ACTIVE';
  const isPro = sub.plan === 'MEDIUM' || sub.plan === 'HIGH';

  return { sub, loading, canAccess, hasPlan, isPro, features };
}

export type { SubscriptionInfo };
