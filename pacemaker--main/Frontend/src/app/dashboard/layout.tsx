'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Video, Database, 
  ClipboardList, BarChart, Settings, 
  BookOpen, Trophy, Clock, MonitorPlay, 
  Activity, ChevronRight, Stethoscope, Zap, Crown, Lock,
  Repeat, MessageSquare, FileText, GitBranch, Image, Wrench, TrendingUp
} from 'lucide-react';
import AiChatbot from '@/components/AiChatbot';
import { useSubscription, FeatureKey } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { getLevel } from '@/lib/academicLevels';

const MENU_GROUPS: { label: string; items: { icon: any; label: string; href: string; feature: FeatureKey }[] }[] = [
  {
    label: 'Learning',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', feature: 'dashboard' },
      { icon: Video, label: 'Video Library', href: '/dashboard/videos', feature: 'videos' },
      { icon: MonitorPlay, label: 'Live Classes', href: '/dashboard/live', feature: 'live' },
      { icon: BookOpen, label: 'Study Material', href: '/dashboard/study-material', feature: 'study-material' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { icon: Database, label: 'Question Bank', href: '/dashboard/qbank', feature: 'qbank' },
      { icon: ClipboardList, label: 'Exam Builder', href: '/dashboard/exams', feature: 'exams' },
      { icon: Activity, label: 'Patient Simulation', href: '/dashboard/patient-simulation', feature: 'patient-simulation' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { icon: BarChart, label: 'Performance', href: '/dashboard/performance', feature: 'performance' },
      { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard', feature: 'leaderboard' },
      { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics', feature: 'analytics' },
      { icon: Zap, label: 'Achievements', href: '/dashboard/achievements', feature: 'achievements' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { icon: Repeat, label: 'Revision Videos', href: '/dashboard/revision-videos', feature: 'revision-videos' },
      { icon: MessageSquare, label: 'Interactive MCQ Discussions', href: '/dashboard/mcq-discussions', feature: 'mcq-discussions' },
      { icon: GitBranch, label: 'Flowcharts', href: '/dashboard/flowcharts', feature: 'flowcharts' },
      { icon: Image, label: 'Clinical Images', href: '/dashboard/clinical-images', feature: 'clinical-images' },
      { icon: Wrench, label: 'Revision Tools', href: '/dashboard/revision-tools', feature: 'revision-tools' },
    ],
  },
];

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { canAccess, hasPlan, sub, loading: subLoading } = useSubscription();

  const [academicLabel, setAcademicLabel] = useState('Medical Student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const levelId = localStorage.getItem('academicLevelId') || '';
    if (levelId) {
      const level = getLevel(levelId);
      if (level) setAcademicLabel(level.label);
    }
  }, []);

  useEffect(() => {
    if (!subLoading && !loading && user?.role === 'STUDENT' && !hasPlan) {
      router.replace('/pricing');
    }
  }, [subLoading, loading, user, hasPlan, router]);

  const userName = user?.name || 'Student';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const planLabel = sub.plan === 'HIGH' ? 'Plan C' : sub.plan === 'MEDIUM' ? 'Plan B' : sub.plan === 'BASIC' ? 'Plan A' : null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC]">
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-64 hidden md:flex flex-col z-10 border-r border-white/10 bg-[#0F172A] shrink-0"
      >
        {/* Profile card */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-cyan-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-black text-white leading-tight truncate">{userName}</span>
              <span className="text-xs font-bold text-[#5EEAD4] uppercase tracking-widest mt-0.5">{academicLabel}</span>
            </div>
            {mounted && hasPlan ? (
              <div className="shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              </div>
            ) : null}
          </div>
          {mounted && !hasPlan ? (
            <Link
              href="/pricing"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
            >
              <Crown className="w-3.5 h-3.5" /> Become a Pro Member
            </Link>
          ) : mounted && planLabel ? (
            <div className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest">
              <Crown className="w-3 h-3 text-amber-400" /> {planLabel} • Active
            </div>
          ) : null}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
          {!mounted ? null : MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-base font-black text-white/30 uppercase tracking-[0.2em]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const locked = !canAccess(item.feature);

                  if (locked && item.feature === 'dashboard') return null;

                  const content = (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-[#5EEAD4] rounded-r-full" />
                      )}
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#5EEAD4]' : locked ? 'text-white/10' : 'text-white/40 group-hover:text-white/80'}`} />
                      <span className={`truncate ${locked ? 'text-white/20' : ''}`}>{item.label}</span>
                      {locked && (
                        <Lock className="w-3 h-3 text-amber-500/60 ml-auto shrink-0" />
                      )}
                      {!locked && isActive && <ChevronRight className="w-3 h-3 text-white/45 ml-auto shrink-0" />}
                    </>
                  );

                  if (locked) {
                    return (
                      <Link
                        key={item.href}
                        href="/pricing"
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-lg font-bold relative group ${
                          isActive
                            ? 'text-[#5EEAD4] bg-white/15 border border-white/10'
                            : 'text-white/50 hover:text-[#5EEAD4] hover:bg-white/5'
                        }`}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-base font-bold relative group ${
                        isActive
                          ? 'text-[#5EEAD4] bg-white/15 border border-white/10'
                          : 'text-white/50 hover:text-[#5EEAD4] hover:bg-white/5'
                      }`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: study goal + settings */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Daily Goal
              </span>
            </div>
            <p className="text-xs text-white/30 font-medium mt-1.5">Set your study goals in settings</p>
          </div>

          <Link href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white/80 rounded-xl hover:bg-white/5 transition-all font-bold text-base"
          >
            <Settings className="w-4 h-4" /> My Account
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC]">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {children}
        </div>
        <AiChatbot role="student" />
      </main>
    </div>
  );
}
