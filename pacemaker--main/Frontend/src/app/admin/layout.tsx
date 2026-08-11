'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Video, Radio, Database, Users, BarChart, LayoutDashboard, Settings, ClipboardList, MessageSquare, FileText, MonitorPlay, Trophy, Menu, X, Activity, Repeat, GitBranch, Image, Wrench, TrendingUp } from 'lucide-react';
import AiChatbot from '@/components/AiChatbot';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false); // Close sidebar on page change
  }, [pathname]);

  const role = user?.role || null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: role === 'admin' ? '/admin' : '/instructor' },
    { icon: Video, label: 'Videos', href: role === 'admin' ? '/admin/videos' : '/instructor/videos' },
    { icon: MonitorPlay, label: 'Recordings', href: '/instructor/recordings' },
    ...(role === 'admin' ? [
      { icon: Trophy, label: 'Leaderboard Settings', href: '/admin/leaderboard' },
      { icon: Users, label: 'Users', href: '/admin/users' },
      { icon: Users, label: 'Instructors', href: '/admin/instructors' },
      { icon: MessageSquare, label: 'Forum Settings', href: '/admin/forum-settings' }
    ] : [
      { icon: Trophy, label: 'Leaderboard', href: '/instructor/leaderboard' },
      { icon: Radio, label: 'Live Ecosystem', href: '/instructor/live' },
      { icon: Database, label: 'Q-Bank', href: '/instructor/qbank' },
      { icon: ClipboardList, label: 'Exam Builder', href: '/instructor/exams' },
      { icon: Activity, label: 'Patient Sim Settings', href: '/instructor/patient-simulation' },
      { icon: FileText, label: 'Study Material', href: '/instructor/study-material' },
      { icon: Repeat, label: 'Revision Videos', href: '/instructor/revision-videos' },
      { icon: MessageSquare, label: 'MCQ Discussions', href: '/instructor/mcq-discussions' },
      { icon: GitBranch, label: 'Flowcharts', href: '/instructor/flowcharts' },
      { icon: Image, label: 'Clinical Images', href: '/instructor/clinical-images' },
      { icon: Wrench, label: 'Revision Tools', href: '/instructor/revision-tools' },
      { icon: BarChart, label: 'Analytics', href: '/instructor/analytics' },
      { icon: TrendingUp, label: 'Advanced Analytics', href: '/instructor/advanced-analytics' },
    ]),
  ];

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Sidebar - Collapsible on Mobile */}
      <aside className={`w-64 border-r border-white/10 flex flex-col z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] transition-transform duration-300 fixed md:static inset-y-0 left-0 bg-[#0F172A] text-white ${
        isSidebarOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-2">
            <span className="text-xs font-bold text-primary-300 uppercase tracking-widest">
              {role === 'admin' ? 'Super Admin' : 'Instructor'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {role === 'admin' ? 'Global Control' : 'Command Center'}
          </h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={index}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative overflow-hidden group ${
                  isActive 
                    ? 'text-white bg-white/10 border border-white/10 shadow-sm' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5EEAD4] rounded-r-full"></div>
                )}
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#5EEAD4]' : 'text-white/40 group-hover:text-white'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors font-medium">
            <Settings className="w-5 h-5 text-white/40" />
            Platform Settings
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB] flex flex-col w-full text-stone-900">
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
            {role === 'admin' ? 'Super Admin' : 'Instructor'}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-transparent to-teal-50/20 -z-10 pointer-events-none"></div>
        <div className="flex-1 p-4 sm:p-8 lg:p-12">
          {children}
        </div>
        <div className="border-t border-gray-200/50">
          <footer className="bg-transparent py-8">
            <div className="px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-gray-500 font-medium">© 2026 PaceMaker Platform. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="#" className="text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-500 hover:text-primary-600 transition-colors">Support</Link>
              </div>
            </div>
          </footer>
        </div>
        <AiChatbot role="instructor" />
      </main>
    </div>
  );
}
