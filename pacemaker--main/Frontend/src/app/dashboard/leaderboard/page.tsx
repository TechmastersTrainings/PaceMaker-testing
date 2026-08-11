'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Search, Download, ChevronLeft, ChevronRight, 
  Sparkles, Award, Star, BookOpen, Clock, Activity, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area
} from 'recharts';
import { 
  getLeaderboardStudents, getLeaderboardSettings, exportToCSV, 
  StudentRankItem, recalculateLeaderboard
} from '@/lib/leaderboardStore';
import { leaderboardService, AVAILABLE_BADGES } from '@/services/leaderboardService';
import ErrorBoundary from '@/components/ErrorBoundary';

const SUBJECTS = [
  'Overall', 'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 
  'Pharmacology', 'Microbiology', 'Forensic Medicine', 
  'Social & Preventive Medicine', 'Cardiology'
];

import SubscriptionGuard from '@/components/SubscriptionGuard';

export default function StudentLeaderboardPage() {
  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="leaderboard" featureName="Leaderboard">
        <StudentLeaderboard />
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

function StudentLeaderboard() {
  const [students, setStudents] = useState<StudentRankItem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'allTime' | 'monthly' | 'weekly'>('allTime');
  const [subject, setSubject] = useState<string>('Overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(localStorage.getItem('currentUser') || 'Student');
    
    // Trigger sync & load
    recalculateLeaderboard();
    setSettings(getLeaderboardSettings());

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        if (timeframe === 'weekly') {
          const data = await leaderboardService.getWeeklyLeaderboard();
          const mapped: StudentRankItem[] = data.map((entry, index) => ({
            userId: String(entry.userId),
            name: entry.name || `User ${entry.userId}`,
            avatar: entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${entry.userId}`,
            averageScore: entry.totalScore,
            totalMarks: entry.totalScore * 10,
            accuracy: 85,
            totalTests: 10,
            weeklyAverageScore: entry.totalScore,
            weeklyTests: 12,
            weeklyAccuracy: 88,
            monthlyAverageScore: entry.totalScore,
            monthlyTests: 40,
            monthlyAccuracy: 86,
            streakWeeks: 3,
            hasPerfectScore: entry.totalScore === 100,
            badges: index === 0 ? ['top3'] : index === 1 ? ['consistent'] : index === 2 ? ['improved'] : [],
            scoresBySubject: {}
          }));
          setStudents(mapped);
        } else if (timeframe === 'monthly') {
          const data = await leaderboardService.getMonthlyLeaderboard();
          const mapped: StudentRankItem[] = data.map((entry, index) => ({
            userId: String(entry.userId),
            name: entry.name || `User ${entry.userId}`,
            avatar: entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${entry.userId}`,
            averageScore: entry.totalScore,
            totalMarks: entry.totalScore * 10,
            accuracy: 85,
            totalTests: 10,
            weeklyAverageScore: entry.totalScore,
            weeklyTests: 12,
            weeklyAccuracy: 88,
            monthlyAverageScore: entry.totalScore,
            monthlyTests: 40,
            monthlyAccuracy: 86,
            streakWeeks: 3,
            hasPerfectScore: entry.totalScore === 100,
            badges: index === 0 ? ['top3'] : index === 1 ? ['consistent'] : index === 2 ? ['improved'] : [],
            scoresBySubject: {}
          }));
          setStudents(mapped);
        } else {
          // timeframe === 'allTime'
          const data = await leaderboardService.getMonthlyLeaderboard();
          const mapped: StudentRankItem[] = data.map((entry, index) => ({
            userId: String(entry.userId),
            name: entry.name || `User ${entry.userId}`,
            avatar: entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user_${entry.userId}`,
            averageScore: entry.totalScore,
            totalMarks: entry.totalScore * 10,
            accuracy: 85,
            totalTests: 10,
            weeklyAverageScore: entry.totalScore,
            weeklyTests: 12,
            weeklyAccuracy: 88,
            monthlyAverageScore: entry.totalScore,
            monthlyTests: 40,
            monthlyAccuracy: 86,
            streakWeeks: 3,
            hasPerfectScore: entry.totalScore === 100,
            badges: index === 0 ? ['top3'] : index === 1 ? ['consistent'] : index === 2 ? ['improved'] : [],
            scoresBySubject: {}
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setStudents(getLeaderboardStudents());
      }
    };

    if (mounted) {
      loadLeaderboardData();
    }
  }, [timeframe, subject, mounted]);

  // Filter students based on min tests required in overall or subject
  const minTestsFilter = (student: StudentRankItem) => {
    if (!settings) return true;
    const minTests = settings.minTestsRequired || 5;

    // Check if student is excluded by admin
    if (settings.excludedStudents && settings.excludedStudents.includes(student.userId)) {
      return false;
    }

    if (subject === 'Overall') {
      if (timeframe === 'weekly') return student.weeklyTests >= minTests;
      if (timeframe === 'monthly') return student.monthlyTests >= minTests;
      return student.totalTests >= minTests;
    } else {
      const subData = student.scoresBySubject[subject];
      return subData ? subData.totalTests >= minTests : false;
    }
  };

  // Helper to extract score based on subject & timeframe
  const getStudentStats = (student: StudentRankItem) => {
    if (subject === 'Overall') {
      if (timeframe === 'weekly') {
        return {
          score: student.weeklyAverageScore,
          tests: student.weeklyTests,
          accuracy: student.weeklyAccuracy
        };
      }
      if (timeframe === 'monthly') {
        return {
          score: student.monthlyAverageScore,
          tests: student.monthlyTests,
          accuracy: student.monthlyAccuracy
        };
      }
      return {
        score: student.averageScore,
        tests: student.totalTests,
        accuracy: student.accuracy
      };
    } else {
      const subData = student.scoresBySubject[subject];
      return {
        score: subData ? subData.averageScore : 0,
        tests: subData ? subData.totalTests : 0,
        accuracy: subData ? subData.accuracy : 0
      };
    }
  };

  // Process, filter, and sort students
  const processedStudents = students
    .filter(minTestsFilter)
    .map(s => {
      const stats = getStudentStats(s);
      return {
        ...s,
        currentScore: stats.score,
        currentTests: stats.tests,
        currentAccuracy: stats.accuracy
      };
    })
    // Sort descending by score, tiebreaker on accuracy then total tests
    .sort((a, b) => {
      if (b.currentScore !== a.currentScore) return b.currentScore - a.currentScore;
      if (b.currentAccuracy !== a.currentAccuracy) return b.currentAccuracy - a.currentAccuracy;
      return b.currentTests - a.currentTests;
    })
    // Map in ranks
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  // Filtered by search query
  const searchedStudents = processedStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Self student item
  const currentStudentRankItem = processedStudents.find(s => 
    s.name.toLowerCase() === currentUser.toLowerCase()
  );

  // Top 3 Podium Students
  const top3 = processedStudents.slice(0, 3);

  // Paginated students list
  const totalPages = Math.ceil(searchedStudents.length / itemsPerPage);
  const paginatedStudents = searchedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Recharts Top 10 Data
  const top10Data = processedStudents.slice(0, 10).map(s => ({
    name: s.name.replace('Dr. ', ''),
    score: s.currentScore,
    accuracy: s.currentAccuracy
  }));

  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Timeframe', 'Subject', 'Tests Taken', 'Average Score (%)', 'Accuracy (%)', 'Badges Earned'];
    const rows = processedStudents.map(s => [
      s.rank,
      s.name,
      timeframe === 'weekly' ? 'Weekly' : timeframe === 'monthly' ? 'Monthly' : 'All Time',
      subject,
      s.currentTests,
      s.currentScore,
      s.currentAccuracy,
      s.badges.map(b => AVAILABLE_BADGES.find(ab => ab.id === b)?.emoji || '').join(' ')
    ]);
    exportToCSV(headers, rows, `PaceMaker_Leaderboard_${subject}_${timeframe}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-16 text-stone-800">
      
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0D9488] font-bold text-sm tracking-wide uppercase">
            <Trophy className="w-4 h-4" />
            Arena of Excellence
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">
            PaceMaker <span className="text-[#0D9488]">Leaderboard</span>
          </h1>
          <p className="text-sm text-stone-500 font-medium">
            Benchmark your performance against the top medical aspirants nationwide.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Ranks highlights for current student */}
      {currentStudentRankItem ? (
        <div className="mb-10 p-6 bg-gradient-to-r from-[#0D9488]/10 via-[#0D9488]/5 to-transparent rounded-[2.5rem] border border-[#0D9488]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white text-xl font-black shadow-md">
              #{currentStudentRankItem.rank}
            </div>
            <div>
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-widest block">Your Position</span>
              <span className="text-lg font-black text-stone-900 block">{currentStudentRankItem.name}</span>
              <span className="text-xs font-medium text-stone-400">
                Subject: <span className="text-stone-700 font-bold">{subject}</span> • Timeframe: <span className="text-stone-700 font-bold capitalize">{timeframe === 'allTime' ? 'All Time' : timeframe}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-12 text-center">
            <div>
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest block">Tests</span>
              <span className="text-xl font-black text-stone-855 text-stone-800 block">{currentStudentRankItem.currentTests}</span>
            </div>
            <div>
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest block">Avg Score</span>
              <span className="text-xl font-black text-[#0D9488] block">{currentStudentRankItem.currentScore}%</span>
            </div>
            <div>
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest block">Accuracy</span>
              <span className="text-xl font-black text-[#0D9488] block">{currentStudentRankItem.currentAccuracy}%</span>
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest block">Badges Earned</span>
              <div className="flex gap-1.5 mt-1">
                {currentStudentRankItem.badges.length > 0 ? (
                  currentStudentRankItem.badges.map(bid => {
                    const badge = AVAILABLE_BADGES.find(b => b.id === bid);
                    return (
                      <span 
                        key={bid} 
                        className="text-lg" 
                        title={`${badge?.name}: ${badge?.description}`}
                      >
                        {badge?.emoji}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-stone-400 font-bold">No badges yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-stone-50 rounded-[2.5rem] border border-[#0D9488]/20 flex items-center gap-4">
          <Award className="w-8 h-8 text-[#0D9488] shrink-0" />
          <div>
            <h4 className="text-sm font-black text-[#0D9488]">Rank Not Generated Yet</h4>
            <p className="text-xs text-stone-650 text-stone-600 font-semibold mt-0.5">
              Take at least {settings?.minTestsRequired || 5} tests in the selected subject/timeframe to qualify and appear on the leaderboard.
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Medal Podiums */}
      {!isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : top3.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-end">
          
          {/* 2nd Place Silver */}
          {top3[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-stone-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative text-center order-2 md:order-1"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-stone-700 text-xl font-bold shadow-md">
                🥈
              </div>
              <img 
                src={top3[1].avatar} 
                alt={top3[1].name}
                className="w-20 h-20 rounded-full bg-stone-50 mx-auto mb-4 border border-stone-200"
              />
              <h3 className="text-lg font-black text-stone-900 line-clamp-1">{top3[1].name}</h3>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Silver Medalist</p>
              
              <div className="flex gap-1.5 justify-center mt-3 h-6">
                {top3[1].badges.map(bid => (
                  <span key={bid} title={AVAILABLE_BADGES.find(b => b.id === bid)?.name} className="text-md">
                    {AVAILABLE_BADGES.find(b => b.id === bid)?.emoji}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100 bg-stone-50/50 rounded-2xl p-3">
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Avg Score</span>
                  <span className="text-lg font-black text-[#0D9488] block">{top3[1].currentScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Accuracy</span>
                  <span className="text-lg font-black text-[#0D9488] block">{top3[1].currentAccuracy}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place Gold */}
          {top3[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-amber-500/20 rounded-[2.5rem] p-10 shadow-md hover:shadow-2xl transition-all duration-300 relative text-center order-1 md:order-2 md:mb-4 bg-gradient-to-b from-amber-500/[0.03] to-transparent"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-[1.25rem] bg-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-yellow-500/20">
                🥇
              </div>
              <img 
                src={top3[0].avatar} 
                alt={top3[0].name}
                className="w-24 h-24 rounded-full bg-stone-50 mx-auto mb-4 border-2 border-amber-500/20"
              />
              <h3 className="text-xl font-black text-stone-900 line-clamp-1">{top3[0].name}</h3>
              <p className="text-xs font-black text-[#0D9488] uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Overall Champion
              </p>

              <div className="flex gap-1.5 justify-center mt-3 h-6">
                {top3[0].badges.map(bid => (
                  <span key={bid} title={AVAILABLE_BADGES.find(b => b.id === bid)?.name} className="text-md">
                    {AVAILABLE_BADGES.find(b => b.id === bid)?.emoji}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100 bg-amber-500/[0.02] rounded-2xl p-4">
                <div>
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">Avg Score</span>
                  <span className="text-2xl font-black text-[#0D9488] block">{top3[0].currentScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">Accuracy</span>
                  <span className="text-2xl font-black text-[#0D9488] block">{top3[0].currentAccuracy}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place Bronze */}
          {top3[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-stone-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative text-center order-3"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-amber-700/25 flex items-center justify-center text-amber-800 text-xl font-bold shadow-md">
                🥉
              </div>
              <img 
                src={top3[2].avatar} 
                alt={top3[2].name}
                className="w-20 h-20 rounded-full bg-stone-50 mx-auto mb-4 border border-stone-200"
              />
              <h3 className="text-lg font-black text-stone-900 line-clamp-1">{top3[2].name}</h3>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Bronze Medalist</p>

              <div className="flex gap-1.5 justify-center mt-3 h-6">
                {top3[2].badges.map(bid => (
                  <span key={bid} title={AVAILABLE_BADGES.find(b => b.id === bid)?.name} className="text-md">
                    {AVAILABLE_BADGES.find(b => b.id === bid)?.emoji}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100 bg-stone-50/50 rounded-2xl p-3">
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Avg Score</span>
                  <span className="text-lg font-black text-[#0D9488] block">{top3[2].currentScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Accuracy</span>
                  <span className="text-lg font-black text-[#0D9488] block">{top3[2].currentAccuracy}%</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      ) : (
        <div className="py-12 bg-white rounded-[2.5rem] border border-dashed border-stone-200 text-center mb-12">
          <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">No medalist data generated</p>
        </div>
      )}

      {/* Control filters bar */}
      <div className="bg-white rounded-[2.5rem] border border-stone-200/60 p-8 shadow-sm mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-stone-100/80 border border-stone-200/60 rounded-2xl p-1.5 flex gap-1.5">
            <button
              onClick={() => { timeframe === 'allTime' ? null : (setTimeframe('allTime'), setCurrentPage(1)); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${timeframe === 'allTime' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
            >
              All Time
            </button>
            <button
              onClick={() => { timeframe === 'monthly' ? null : (setTimeframe('monthly'), setCurrentPage(1)); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${timeframe === 'monthly' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => { timeframe === 'weekly' ? null : (setTimeframe('weekly'), setCurrentPage(1)); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${timeframe === 'weekly' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-stone-500 hover:text-stone-850'}`}
            >
              Weekly
            </button>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-400 ml-2" />
            <select
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setCurrentPage(1); }}
              className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs font-black text-stone-700 outline-none focus:ring-2 focus:ring-[#0D9488] [&>option]:bg-white [&>option]:text-stone-800"
            >
              {SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 placeholder-stone-450 outline-none focus:ring-2 focus:ring-[#0D9488] focus:bg-white transition-all"
            />
          </div>

          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
            className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs font-bold text-stone-700 outline-none focus:ring-2 focus:ring-[#0D9488] [&>option]:bg-white [&>option]:text-stone-800"
          >
            <option value={10}>10 / Page</option>
            <option value={25}>25 / Page</option>
            <option value={50}>50 / Page</option>
          </select>
        </div>

      </div>

      {/* Main Grid: Table & Recharts Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-stone-200/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-150/80 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Aspirant</th>
                    <th className="py-4 px-6 text-center">Tests</th>
                    <th className="py-4 px-6 text-center">Avg Score</th>
                    <th className="py-4 px-6 text-center">Accuracy</th>
                    <th className="py-4 px-6">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {!isLoaded ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6 text-center">
                          <div className="h-8 w-8 bg-stone-100 rounded-xl mx-auto"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-stone-100 shrink-0"></div>
                            <div className="space-y-1.5 w-full">
                              <div className="h-4 w-28 bg-stone-100 rounded"></div>
                              <div className="h-3 w-16 bg-stone-100 rounded"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 w-12 bg-stone-100 rounded mx-auto"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 w-16 bg-stone-100 rounded mx-auto"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 w-16 bg-stone-100 rounded mx-auto"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-1">
                            <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
                            <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedStudents.length > 0 ? (
                    paginatedStudents.map((stud) => {
                      const isSelf = stud.name.toLowerCase() === currentUser.toLowerCase();
                      return (
                        <tr 
                          key={stud.userId}
                          className={`group transition-all hover:bg-stone-50/50 ${isSelf ? 'bg-[#0D9488]/5 font-semibold' : ''}`}
                        >
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex w-8 h-8 rounded-xl items-center justify-center text-xs font-bold ${
                              stud.rank === 1 ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                              stud.rank === 2 ? 'bg-slate-500/10 text-slate-700 border border-slate-500/20' :
                              stud.rank === 3 ? 'bg-amber-700/10 text-amber-800 border border-amber-700/20' :
                              'text-stone-400'
                            }`}>
                              {stud.rank}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img 
                                src={stud.avatar} 
                                alt={stud.name} 
                                className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 group-hover:scale-105 transition-transform"
                              />
                              <div className="flex flex-col">
                                <span className={`text-sm ${isSelf ? 'text-[#0D9488] font-extrabold' : 'text-stone-850 font-bold'}`}>
                                  {stud.name}
                                </span>
                                <span className="text-[10px] text-stone-400 font-semibold">User ID: {stud.userId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center text-sm font-bold text-stone-600">{stud.currentTests}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-sm font-extrabold text-[#0D9488]">{stud.currentScore}%</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-sm font-extrabold text-[#0D9488]">{stud.currentAccuracy}%</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-1.5">
                              {stud.badges.map(bid => {
                                const badge = AVAILABLE_BADGES.find(b => b.id === bid);
                                return (
                                  <span 
                                    key={bid} 
                                    className="text-md cursor-help"
                                    title={`${badge?.name}: ${badge?.description}`}
                                  >
                                    {badge?.emoji}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-40">
                           <Trophy className="w-12 h-12 text-stone-300 mb-2" />
                           <p className="text-sm font-black text-stone-400 uppercase tracking-widest">No records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
                <span className="text-xs font-bold text-stone-500">
                  Showing {Math.min(searchedStudents.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(searchedStudents.length, currentPage * itemsPerPage)} of {searchedStudents.length} entries
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 hover:text-stone-800 transition-colors disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-stone-700 px-3">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 hover:text-stone-800 transition-colors disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recharts Chart */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-[2.5rem] border border-stone-200/60 p-8 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#0D9488] font-bold text-xs uppercase tracking-widest mb-2">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Visual Analytics
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-6">Top 10 Performance</h3>
            </div>
            
            <div className="h-80 w-full flex items-center justify-center">
              {mounted && top10Data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10Data} margin={{ top: 10, right: 5, left: -25, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', color: '#111827', fontSize: '11px', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(29, 78, 216, 0.04)' }}
                    />
                    <Bar dataKey="score" fill="#0D9488" radius={[8, 8, 0, 0]}>
                      {top10Data.map((entry, index) => {
                        let barColor = '#0D9488'; // primary blue
                        if (index === 0) barColor = '#ffd700'; // Gold
                        else if (index === 1) barColor = '#94a3b8'; // Silver
                        else if (index === 2) barColor = '#b45309'; // Bronze
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center opacity-40">
                  <Trophy className="w-12 h-12 text-stone-300 mb-2" />
                  <p className="text-xs font-black text-stone-400 uppercase tracking-widest">No chart data</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
              <span>Time: All Time</span>
              <span>Subject: {subject}</span>
            </div>
          </div>

          {/* Leaderboard reset notifier */}
          <div className="bg-gradient-to-tr from-[#0F172A] to-[#1E1B4B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="bg-white/10 rounded-xl p-2.5 w-10 h-10 flex items-center justify-center border border-white/10">
                <Clock className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-md">Weekly Ranks Cycle</h4>
                <p className="text-white/80 text-xs mt-1.5 font-medium leading-relaxed">
                  The weekly leaderboard resets automatically on <span className="font-bold text-[#0D9488] capitalize">{settings?.resetDay || 'Monday'}</span> mornings. Keep taking tests to retain your active weekly streak and climb ranks!
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
