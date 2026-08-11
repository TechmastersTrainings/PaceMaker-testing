'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart, PieChart, Activity, BookOpen, Target } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

function AnalyticsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats] = useState({
    totalStudyTime: '24h 30m',
    examsTaken: 12,
    avgScore: '72%',
    questionsSolved: 845,
    weakAreas: ['Cardiology', 'Pharmacology'],
    strongAreas: ['Anatomy', 'Biochemistry'],
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="analytics">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Track your learning progress and performance</p>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, label: 'Study Time', value: stats.totalStudyTime, color: 'bg-blue-50 text-blue-600' },
              { icon: BarChart, label: 'Exams Taken', value: stats.examsTaken.toString(), color: 'bg-green-50 text-green-600' },
              { icon: Target, label: 'Avg Score', value: stats.avgScore, color: 'bg-amber-50 text-amber-600' },
              { icon: Activity, label: 'Questions Solved', value: stats.questionsSolved.toLocaleString(), color: 'bg-purple-50 text-purple-600' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white rounded-xl border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 bg-white rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-gray-900">Weak Areas</h3>
              </div>
              {stats.weakAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.weakAreas.map(area => (
                    <span key={area} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">{area}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No weak areas identified yet</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 bg-white rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-extrabold text-gray-900">Strong Areas</h3>
              </div>
              {stats.strongAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.strongAreas.map(area => (
                    <span key={area} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">{area}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No strong areas identified yet</p>
              )}
            </motion.div>
          </div>
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

export default function Page() {
  return <AnalyticsPage />;
}
