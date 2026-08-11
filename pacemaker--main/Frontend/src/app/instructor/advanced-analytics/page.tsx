'use client';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import { useState, useEffect } from 'react';

export default function AdvancedAnalyticsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);
  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-500 mt-1">In-depth platform analytics and reporting</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Student Engagement', 'Content Performance', 'Revenue Reports', 'Completion Rates', 'Popular Topics', 'Time Trends'].map((label, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-extrabold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-400">Detailed analytics coming soon</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
