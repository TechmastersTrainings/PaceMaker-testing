'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Video, Database,
  ClipboardList, BarChart, Settings,
  MonitorPlay, Activity, FileText, Radio,
  Trophy, ChevronRight, Menu, X,
  Repeat, MessageSquare, GitBranch, Image, Wrench, TrendingUp
} from 'lucide-react';
import AiChatbot from '@/components/AiChatbot';
import { useAuth } from '@/contexts/AuthContext';

const MENU_GROUPS: { label: string; items: { icon: any; label: string; href: string }[] }[] = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/instructor' },
      { icon: Video, label: 'Videos', href: '/instructor/videos' },
      { icon: MonitorPlay, label: 'Recordings', href: '/instructor/recordings' },
      { icon: Radio, label: 'Live Ecosystem', href: '/instructor/live' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: Database, label: 'Q-Bank', href: '/instructor/qbank' },
      { icon: ClipboardList, label: 'Exam Builder', href: '/instructor/exams' },
      { icon: Activity, label: 'Patient Sim Settings', href: '/instructor/patient-simulation' },
      { icon: FileText, label: 'Study Material', href: '/instructor/study-material' },
      { icon: Repeat, label: 'Revision Videos', href: '/instructor/revision-videos' },
      { icon: MessageSquare, label: 'Interactive MCQ Discussions', href: '/instructor/mcq-discussions' },
      { icon: GitBranch, label: 'Flowcharts', href: '/instructor/flowcharts' },
      { icon: Image, label: 'Clinical Images', href: '/instructor/clinical-images' },
      { icon: Wrench, label: 'Revision Tools', href: '/instructor/revision-tools' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart, label: 'Analytics', href: '/instructor/analytics' },
      { icon: TrendingUp, label: 'Advanced Analytics', href: '/instructor/advanced-analytics' },
      { icon: Trophy, label: 'Leaderboard', href: '/instructor/leaderboard' },
    ],
  },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const userName = user?.name || 'Instructor';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const role = user?.role || 'instructor';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC]">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`w-64 flex flex-col z-40 border-r border-white/10 bg-[#0F172A] shrink-0 transition-transform duration-300 fixed md:static inset-y-0 left-0 ${
        isSidebarOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Profile card */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-white leading-tight truncate">{userName}</span>
              <span className="text-[10px] font-bold text-[#5EEAD4] uppercase tracking-widest mt-0.5">
                {role === 'trainer' ? 'Trainer' : 'Instructor'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
          {MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-sm font-black text-white/30 uppercase tracking-[0.2em]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/instructor' && pathname.startsWith(item.href));

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
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-[#5EEAD4] rounded-r-full" />
                      )}
                      <item.icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-[#5EEAD4]' : 'text-white/40 group-hover:text-white/80'}`} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 text-white/45 ml-auto shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: settings */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white/80 rounded-xl hover:bg-white/5 transition-all font-bold text-sm"
          >
            <Settings className="w-4 h-4" /> My Account
          </Link>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30 mt-16"
        />
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC]">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 text-gray-700 font-bold text-xs bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            {isSidebarOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
            <span>Menu</span>
          </button>
          <span className="font-extrabold text-xs text-gray-900 uppercase tracking-widest">
            Instructor
          </span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {children}
        </div>
        <AiChatbot role="instructor" />
      </main>
    </div>
  );
}
