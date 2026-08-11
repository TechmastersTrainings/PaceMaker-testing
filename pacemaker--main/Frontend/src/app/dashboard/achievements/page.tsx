'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame, Zap, Award, Medal, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { examService } from '@/services/examService';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

function AchievementsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const exams = await examService.getAllExams();
        let attempts: any = {};
        try {
          attempts = JSON.parse(localStorage.getItem('lms_exam_attempts_v1') || '{}');
        } catch (e) {}

    const submittedAttempts = Object.values(attempts).filter((a: any) => a.submittedAt);
    
    // Calculate XP: 500 per attempt + 200 per pass
    const calculatedXp = (submittedAttempts.length * 500) + (submittedAttempts.filter((a: any) => a.passed).length * 200);
    setXp(calculatedXp);
    
    // Level: 1 level per 2000 XP
    const calculatedLevel = Math.floor(calculatedXp / 2000) + 1;
    setLevel(calculatedLevel);

    // Badges Logic
    const newBadges = [
      { 
        title: 'Early Bird', 
        desc: 'Completed a session before 8 AM', 
        earned: submittedAttempts.some((a: any) => new Date(a.submittedAt).getHours() < 8),
        icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10'
      },
      { 
        title: 'First Step', 
        desc: 'Completed your first exam', 
        earned: submittedAttempts.length > 0,
        icon: Award, color: 'text-red-500', bg: 'bg-red-500/10'
      },
      { 
        title: 'Perfect Score', 
        desc: 'Score 100% in any quiz', 
        earned: submittedAttempts.some((a: any) => {
           const exam = exams.find(e => e.id === a.examId);
           return exam && a.score === exam.totalMarks;
        }),
        icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-400/10'
      },
      { 
        title: 'Streak Starter', 
        desc: '3 exams in 3 days', 
        earned: submittedAttempts.length >= 3,
        icon: Medal, color: 'text-red-400', bg: 'bg-red-400/10'
      }
    ];
    setBadges(newBadges);

    // Recent Activity
    const activity = submittedAttempts.slice(-3).map((a: any) => ({
      title: a.passed ? 'Exam Passed' : 'Exam Attempted',
      time: new Date(a.submittedAt).toLocaleDateString(),
      type: a.passed ? 'badge' : 'course'
    })).reverse();
    setRecentActivity(activity);

      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadAchievements();
  }, []);

  const stats = [
    { label: 'Total XP', value: xp.toLocaleString(), icon: Zap, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/10' },
    { label: 'Rank', value: `#${Math.max(1, 100 - Math.floor(xp/100))}`, icon: Trophy, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/10' },
    { label: 'Level', value: level.toString(), icon: Star, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/10' },
    { label: 'Points', value: Math.floor(xp/10).toString(), icon: Target, color: 'text-[#0D9488]', bg: 'bg-[#0D9488]/10' },
  ];

  const handleViewHistory = () => {
    window.location.href = '/dashboard/exams';
  };

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 text-stone-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-[10px] font-black uppercase tracking-widest mb-4 border border-[#0D9488]/20">
            <Trophy className="w-3.5 h-3.5" /> Rewards & Recognition
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Your <span className="text-[#0D9488]">Achievements</span></h1>
          <p className="text-stone-500 font-medium mt-2 max-w-lg">Track your progress, unlock exclusive badges, and climb the leaderboard through consistent learning.</p>
        </div>
        
        <div className="bg-white px-8 py-4 rounded-3xl border border-stone-200/60 shadow-md flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Weekly Rank</p>
              <p className="text-2xl font-black text-stone-900">#{Math.max(1, 100 - Math.floor(xp/100))}</p>
           </div>
           <div className="w-px h-10 bg-stone-150"></div>
           <div className="text-center">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Percentile</p>
              <p className="text-2xl font-black text-[#0D9488]">Top {Math.max(1, 15 - Math.floor(xp/1000))}%</p>
           </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] border border-stone-200/60 shadow-md hover:shadow-lg hover:border-[#0D9488] transition-all duration-300 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-stone-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Badge Collection */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Award className="w-6 h-6 text-[#0D9488]" />
            Badge Collection
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {badges.map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.05) }}
                className={`relative p-6 rounded-[2.5rem] border transition-all duration-300 ${
                  badge.earned 
                    ? 'bg-white border-stone-200/60 shadow-md hover:shadow-lg hover:border-[#0D9488]/30' 
                    : 'bg-stone-50/50 border-dashed border-stone-200 grayscale opacity-45'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-3xl ${badge.bg} flex items-center justify-center shrink-0`}>
                    <badge.icon className={`w-8 h-8 ${badge.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-black text-lg ${badge.earned ? 'text-stone-850' : 'text-stone-400'}`}>{badge.title}</h3>
                    <p className="text-xs font-medium text-stone-500 mt-1 leading-relaxed">{badge.desc}</p>
                    {badge.earned && (
                      <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-[#0D9488] uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Earned
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Level Progress & Activity */}
        <div className="space-y-8">
          {/* Level Progress */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-cyan-950">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#0D9488] uppercase tracking-widest mb-1">Current Level</p>
                  <h3 className="text-4xl font-black">Level {level}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-cyan-200/70 uppercase tracking-widest">Next Level</p>
                  <p className="text-sm font-black text-[#0D9488]">{level + 1}</p>
                </div>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(xp % 2000) / 20}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-[#0D9488] rounded-full"
                />
              </div>
              
              <p className="text-xs font-medium text-cyan-200/70 text-center">
                <span className="text-white font-bold">{2000 - (xp % 2000)} XP</span> more to reach Level {level + 1}
              </p>
            </div>
            <Star className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12 pointer-events-none" />
          </div>

          {/* Recent Milestones */}
          <div className="bg-white rounded-[2.5rem] border border-stone-200/60 shadow-md p-8">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-6">Recent Milestones</h3>
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-stone-100"></div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                    activity.type === 'badge' ? 'bg-[#0D9488]/10 text-[#0D9488]' :
                    activity.type === 'level' ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-stone-100 text-stone-605 text-stone-600'
                  }`}>
                    {activity.type === 'badge' ? <Award className="w-5 h-5 text-[#0D9488]" /> :
                     activity.type === 'level' ? <Zap className="w-5 h-5 text-[#0D9488]" /> : <CheckCircle2 className="w-5 h-5 text-stone-600" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-850">{activity.title}</h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-stone-400 italic">No recent activity to show.</p>
              )}
            </div>
            
            <button 
              onClick={handleViewHistory}
              className="w-full mt-8 py-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm active:scale-95"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="achievements" featureName="Achievements">
        <AchievementsPage />
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

