'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, BookOpen, Clock, Activity, Target, Flame,
  CheckCircle2, Play, ChevronRight, BarChart, GraduationCap, Video, Zap, ClipboardList,
  Search, ArrowUpRight, BookMarked, Layers, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { examService } from '@/services/examService';
import { dashboardService, type AchievementResponse, type StreakResponse } from '@/services/dashboardService';
import { videoService } from '@/services/videoService';
import { courseService } from '@/services/courseService';
import apiClient from '@/lib/apiClient';
import { getLevel } from '@/lib/academicLevels';

export default function StudentDashboardPage() {
  return (
    <ErrorBoundary>
      <StudentDashboard />
    </ErrorBoundary>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
});

function StudentDashboard() {
  const [userName, setUserName] = useState<string>('Student');
  const [academicLabel, setAcademicLabel] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [latestExams, setLatestExams] = useState<any[]>([]);
  const [latestLive, setLatestLive] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');

  // Dynamic Student Stats
  const [overallScore, setOverallScore] = useState<number>(0);
  const [studyHours, setStudyHours] = useState<string>('0h');
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalVideos, setTotalVideos] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);

  const categoryColors: Record<string, string> = {
    ANATOMY: 'bg-teal-500',
    PHYSIOLOGY: 'bg-primary-500',
    BIOCHEMISTRY: 'bg-violet-500',
    PATHOLOGY: 'bg-emerald-500',
    PHARMACOLOGY: 'bg-amber-500',
    MICROBIOLOGY: 'bg-rose-500',
    MEDICINE: 'bg-blue-500',
    SURGERY: 'bg-orange-500',
    GYNECOLOGY: 'bg-pink-500',
    ENT: 'bg-cyan-500',
    OPHTHALMOLOGY: 'bg-indigo-500',
    ORTHOPEDICS: 'bg-lime-500',
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const user = localStorage.getItem('currentUser');
        if (user) setUserName(user);
        const levelId = localStorage.getItem('academicLevelId') || '';
        if (levelId) {
          const level = getLevel(levelId);
          if (level) setAcademicLabel(level.label);
        }

        // 1. Fetch Exams from Backend
        const exams = await examService.getAllExams();
        if (exams && exams.length > 0) {
          setLatestExams(exams.slice(0, 2));
        } else {
          const savedExams = localStorage.getItem('lms_exams_v1');
          if (savedExams) {
            setLatestExams(JSON.parse(savedExams).slice(0, 2));
          }
        }

        // 2. Fetch Live Sessions
        const savedLive = localStorage.getItem('lms_live_sessions_v3');
        if (savedLive) {
          const parsed = JSON.parse(savedLive);
          setLatestLive(parsed.filter((s: any) => s.status === 'live' || s.status === 'scheduled').slice(0, 1));
        }

        // 3. Fetch Student Overall Analytics from Backend
        try {
          const stats = await dashboardService.getStudentAnalytics();
          if (stats) {
            setOverallScore(stats.overallScore || 0);
            setStudyHours(stats.totalTimeSpent || '0h');
          }
        } catch (err) {
          console.error("Error fetching overall analytics:", err);
        }

        try {
          const coursesList = await courseService.getAllCourses();
          setTotalCourses(coursesList ? coursesList.length : 0);
        } catch (err) {
          console.error("Error fetching actual courses count:", err);
          setTotalCourses(0);
        }

        try {
          const videosList = await videoService.getAllVideos();
          setTotalVideos(videosList ? videosList.length : 0);
        } catch (err) {
          console.error("Error fetching actual videos count:", err);
          setTotalVideos(0);
        }

        try {
          const streakData = await dashboardService.getStreak();
          if (streakData) {
            setCurrentStreak(streakData.currentStreak || 0);
          }
        } catch (err) {
          console.error("Error fetching streak:", err);
        }

        try {
          const achievementsData = await dashboardService.getUserAchievements();
          setAchievements(achievementsData || []);
        } catch (err) {
          console.error("Error fetching achievements:", err);
        }

        try {
          const videoProgress = await videoService.getCategoryProgress();
          if (videoProgress && videoProgress.length > 0) {
            const mapped = videoProgress
              .filter(p => p.totalVideos > 0)
              .map(p => ({
                subject: p.category.charAt(0) + p.category.slice(1).toLowerCase(),
                progress: p.progressPercentage,
                total: p.totalVideos,
                completed: p.completedVideos,
                color: categoryColors[p.category] || 'bg-stone-500',
              }));
            setCourseProgress(mapped);
          }
        } catch (err) {
          console.error("Error fetching video category progress:", err);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoaded(true);
      }
    }

    fetchData();
  }, []);

  const kpis = [
    { title: 'Enrolled Courses', value: String(totalCourses), icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Videos Available', value: String(totalVideos), icon: Video, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Study Hours', value: studyHours, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Current Streak', value: currentStreak > 0 ? `${currentStreak}d` : '0d', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const filteredCourses = courseProgress.filter((c) => {
    const matchesCategory = searchCategory === 'All' || searchCategory === 'Subjects';
    const matchesQuery = c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  if (!isLoaded) {
    return (
      <div className="w-full">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full text-stone-600 selection:bg-[#0D9488] selection:text-white space-y-8">

      {/* ── Hero Section ── */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl bg-white border border-stone-200/50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <motion.div {...fadeUp(0.05)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-wide mb-4 border border-primary-100"
            >
              <Trophy className="w-3.5 h-3.5" /> Dashboard Overview
            </motion.div>
            <motion.h1 {...fadeUp(0.1)}
              className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-2 tracking-tight"
            >
              Welcome back, <span className="text-primary-600">{userName}</span>
            </motion.h1>
            <motion.p {...fadeUp(0.15)}
              className="text-stone-500 text-base font-medium max-w-lg"
            >
              {academicLabel && <span className="font-bold text-stone-700">{academicLabel}</span>}
              {academicLabel && ' — '}
              {overallScore > 0 ? 'You\'re making solid progress. Keep the momentum going.' : 'Start exploring courses to track your progress.'}
            </motion.p>
          </div>

          {/* Progress Ring */}
          <motion.div {...fadeUp(0.2)} className="shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#106ebe" strokeWidth="8"
                  strokeDasharray={`${overallScore * 3.267} 326.7`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-stone-900 tracking-tight">{overallScore}<span className="text-sm text-primary-500">%</span></span>
                <span className="text-[10px] font-semibold text-stone-400 tracking-wider uppercase mt-0.5">Progress</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={index}
            {...fadeUp(0.1 + index * 0.05)}
            className="relative group bg-white rounded-xl border border-stone-200/50 p-5 hover:border-stone-200 hover:shadow-sm transition-all cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-stone-900 leading-none mb-1">{kpi.value}</p>
                <p className="text-[11px] font-medium text-stone-400 tracking-wide">{kpi.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Course Progress (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-500" />
              Course Progress
            </h2>
            <Link href="/dashboard/videos" className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-stone-200/50 shadow-sm divide-y divide-stone-100">
            {filteredCourses.length > 0 ? filteredCourses.map((course, i) => (
              <div key={i} className="p-5 first:rounded-t-xl last:rounded-b-xl hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${course.color}`} />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-stone-900 truncate">{course.subject}</h3>
                      <p className="text-xs text-stone-400 font-medium mt-0.5">
                        {course.completed} of {course.total} videos completed
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-stone-800 ml-3 shrink-0">{course.progress}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${course.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    className={`h-full rounded-full ${course.color}`}
                  />
                </div>
              </div>
            )) : (
              <div className="p-10 text-center">
                <Search className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-400">No subjects match &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar (1/3) ── */}
        <div className="space-y-5">

          {/* Live / Quick Action */}
          <motion.div {...fadeUp(0.25)}>
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              Continue Learning
            </h2>

            {latestLive.length > 0 ? (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-md text-[10px] font-bold tracking-wider backdrop-blur-sm mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {latestLive[0].status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                  </div>
                  <h3 className="text-sm font-bold mb-1 leading-snug">{latestLive[0].title}</h3>
                  <p className="text-primary-100 text-xs font-medium mb-4">
                    {latestLive[0].instructor && `Instructor: ${latestLive[0].instructor}`}
                    {latestLive[0].time && ` \u2022 ${latestLive[0].time}`}
                  </p>
                  <Link href={latestLive[0].meetingLink || '/dashboard/live'}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary-700 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Join Session
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200/50 p-5">
                <h3 className="text-sm font-semibold text-stone-900 mb-1">No Live Classes</h3>
                <p className="text-xs text-stone-400 mb-3">Check back later for scheduled sessions.</p>
                <Link href="/dashboard/live" className="text-xs font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                  View Schedule &rarr;
                </Link>
              </div>
            )}
          </motion.div>

          {/* Exam Builder */}
          <motion.div {...fadeUp(0.3)} className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-[0.08em] flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-stone-400" />
                Exam Builder
              </h3>
              <Link href="/dashboard/exams" className="text-[11px] font-semibold text-primary-600 hover:text-primary-500">View All</Link>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {(() => {
                const filteredExams = latestExams.filter((exam) => {
                   const matchesCategory = searchCategory === 'All' || searchCategory === 'QBank' || searchCategory === 'Videos';
                   const matchesQuery = exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) || exam.subject?.toLowerCase().includes(searchQuery.toLowerCase());
                   return matchesCategory && matchesQuery;
                });
                return filteredExams.length > 0 ? filteredExams.map((exam, i) => (
                  <Link href={`/exam/${exam.id}`} key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100 hover:border-primary-200 hover:bg-white transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary-50 shrink-0">
                      <ClipboardList className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-stone-900 group-hover:text-primary-600 transition-colors truncate">{exam.title}</h4>
                      <p className="text-[11px] text-stone-400 font-medium">{exam.subject} &bull; {exam.duration}m</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-primary-500 shrink-0 transition-colors" />
                  </Link>
                )) : (
                  <p className="text-xs text-stone-400 text-center py-3">No exams available</p>
                );
              })()}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div {...fadeUp(0.35)} className="bg-white rounded-xl border border-stone-200/50 shadow-sm p-5">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-[0.08em] mb-4 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
              Recent Achievements
            </h3>
            <div className="space-y-2.5">
              {achievements.length > 0 ? achievements.slice(0, 3).map((achievement, i) => (
                <div key={achievement.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                  <div className="p-1.5 rounded-lg bg-emerald-100 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 truncate">{achievement.name}</h4>
                    <p className="text-xs text-stone-400 line-clamp-1">{achievement.description}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-400 font-medium">Start learning to earn badges!</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
