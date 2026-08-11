'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, ChevronRight, Video,
  Bell, Zap, ArrowRight, Monitor,
  Layout, Globe, Star, Activity, Play, GraduationCap,
  BookOpen, CalendarDays,
  X, ChevronDown, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { liveClassService } from '@/services/liveClassService';

type LiveSession = {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'live' | 'completed';
  meetingLink: string;
  description: string;
  course: string;
  batch: string;
  liveType: string;
};

import { LiveClassesSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

export default function StudentLivePagePage() {
  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="live" featureName="Live Classes">
        <StudentLivePage />
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
});

function StudentLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState<string>('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    date: '',
    time: '',
    duration: '60 mins',
    description: '',
    course: 'Cardiology - NEET PG',
    batch: '2026 Regular Batch',
    liveType: 'webinar'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      instructor: '',
      date: '',
      time: '',
      duration: '60 mins',
      description: '',
      course: 'Cardiology - NEET PG',
      batch: '2026 Regular Batch',
      liveType: 'webinar'
    });
    setIsModalOpen(false);
    setIsEditing(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classDateTime = `${formData.date}T${formData.time}:00`;
    const requestData = {
      title: formData.title,
      classDateTime: classDateTime,
      trainerName: formData.instructor,
      topic: formData.course,
      description: formData.description
    };

    try {
      if (isEditing) {
        await liveClassService.updateLiveClass(Number(isEditing), requestData);
      } else {
        await liveClassService.createLiveClass(requestData);
      }
      await loadSessionsFromBackend();
    } catch (err) {
      console.error("Failed to save live class:", err);
      alert("Failed to save live class to database.");
    }
    resetForm();
  };

  const handleEdit = (session: LiveSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(session.id);
    setFormData({
      title: session.title,
      instructor: session.instructor,
      date: session.date,
      time: session.time,
      duration: session.duration,
      description: session.description || '',
      course: session.course,
      batch: session.batch,
      liveType: session.liveType
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this live session?")) {
      try {
        await liveClassService.deleteLiveClass(Number(id));
        await loadSessionsFromBackend();
      } catch (err) {
        console.error("Failed to delete live class:", err);
        alert("Failed to delete live class from database.");
      }
    }
  };

  const loadSessionsFromBackend = async () => {
    try {
      const dbClasses = await liveClassService.getAllLiveClasses();
      const mapped = dbClasses.map((c: any) => {
        const dateTime = new Date(c.classDateTime);
        const dateStr = c.classDateTime.split('T')[0];
        const timeStr = c.classDateTime.split('T')[1]?.substring(0, 5) || '12:00';
        const now = new Date();
        let status: 'live' | 'scheduled' | 'completed' = 'scheduled';
        if (dateTime.getTime() < now.getTime()) {
          if (now.getTime() - dateTime.getTime() > 2 * 60 * 60 * 1000) {
            status = 'completed';
          } else {
            status = 'live';
          }
        }
        return {
          id: String(c.id),
          title: c.title,
          instructor: c.trainerName || 'Master Faculty',
          date: dateStr,
          time: timeStr,
          duration: '60 mins',
          status: status,
          meetingLink: c.zoomJoinUrl || `/live/${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          description: c.description || '',
          course: c.topic || 'Medical Course',
          batch: '2026 Regular Batch',
          liveType: 'webinar'
        };
      });
      setSessions(mapped);
    } catch (err) {
      console.error("Failed to load live classes from database", err);
      setSessions([]);
    }
  };

  useEffect(() => {
    let active = true;
    const loadSessions = () => {
      let roleSaved = localStorage.getItem('userRole');
      const emailSaved = localStorage.getItem('currentUserEmail');
      if (roleSaved === 'student' && emailSaved) {
        const stored = localStorage.getItem('registeredUsers');
        if (stored) {
          try {
            const registeredUsers = JSON.parse(stored);
            const user = registeredUsers[emailSaved];
            if (user && (user.role === 'instructor' || user.role === 'admin')) {
              roleSaved = user.role;
              localStorage.setItem('userRole', user.role);
            }
          } catch (e) {
            console.error("Failed to parse registered users for auto-correct", e);
          }
        }
      }
      if (roleSaved && active) {
        setRole(roleSaved);
      }

      if (active) {
        loadSessionsFromBackend();
      }
    };

    loadSessions();

    const timer = setTimeout(() => {
      if (active) setIsLoaded(true);
    }, 850);

    const interval = setInterval(loadSessions, 5000);
    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const getRelativeDateText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return null;
  };

  if (!isLoaded) {
    return (
      <div className="w-full">
        <LiveClassesSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full text-stone-600 selection:bg-primary-500 selection:text-white space-y-8">

      {/* ── Hero Section ── */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-xl bg-white border border-stone-200/50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-amber-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 px-6 md:px-8 py-10 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div {...fadeUp(0.05)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-wide mb-4 border border-primary-100"
            >
              <GraduationCap className="w-3.5 h-3.5" /> Interactive Live Classes
            </motion.div>
            <motion.h1 {...fadeUp(0.1)}
              className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-3 tracking-tight"
            >
              Learn Live from <span className="text-primary-600">Top Medical Faculty</span>
            </motion.h1>
            <motion.p {...fadeUp(0.15)}
              className="text-base text-stone-500 font-medium max-w-xl leading-relaxed"
            >
              Join high-yield interactive sessions designed for NEET PG, USMLE, and FMGE. Real-time doubt solving with India&apos;s best educators.
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="flex flex-wrap items-center gap-4 mt-6">
              {(role === 'instructor' || role === 'admin') && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer border-none"
                >
                  Schedule Session <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

            </motion.div>
          </div>

          {/* Stats */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3 shrink-0">
            {[
              { icon: Radio, label: 'HD Streaming', desc: '1080p low latency' },
              { icon: Zap, label: 'Live Doubts', desc: 'Real-time Q&A' },
              { icon: CalendarDays, label: 'Recorded', desc: 'Watch anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-lg border border-stone-100 min-w-[200px]">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{item.label}</p>
                  <p className="text-xs text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Live Now Banner ── */}
      {liveSessions.length > 0 && (
        <motion.div {...fadeUp(0.1)}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="relative flex w-3 h-3">
                <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-white" />
              </span>
              <div>
                <p className="text-white/80 text-xs font-bold tracking-wider uppercase">Live Now</p>
                <p className="text-white text-base font-bold">{liveSessions[0].title}</p>
              </div>
            </div>
            <Link href={liveSessions[0].meetingLink.startsWith('/live/') ? liveSessions[0].meetingLink.replace('/live/', '/dashboard/live/') : liveSessions[0].meetingLink}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-emerald-700 rounded-lg text-sm font-bold hover:bg-stone-50 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" /> Join Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Upcoming Schedule ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Upcoming Sessions
          </h2>
        </div>

        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session) => {
              const rel = getRelativeDateText(session.date);
              return (
                <Link
                  href={session.meetingLink.startsWith('/live/') ? session.meetingLink.replace('/live/', '/dashboard/live/') : session.meetingLink}
                  key={session.id}
                  className="group block"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm hover:border-primary-200 hover:shadow-md transition-all h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-wide">
                        {session.liveType}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        {session.time}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                      {session.title}
                    </h3>

                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                        {session.instructor[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">{session.instructor}</p>
                        <p className="text-[11px] text-stone-400 font-medium truncate">{session.course}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        {rel && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${rel === 'Today' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                            {rel}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-stone-600">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {(role === 'instructor' || role === 'admin') ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleEdit(session, e)}
                            className="p-1.5 text-stone-400 hover:text-primary-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer bg-transparent border-none"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(session.id, e)}
                            className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer bg-transparent border-none"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button className="p-1.5 text-stone-400 hover:text-primary-600 rounded-lg hover:bg-stone-100 transition-colors bg-transparent border-none cursor-pointer">
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200/50 p-10 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-400">No upcoming sessions scheduled</p>
          </div>
        )}
      </section>

      {/* ── Schedule Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-[#060f1a]/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar z-10 text-stone-900"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Schedule Session</h2>
                    <p className="text-sm text-stone-400 font-medium">Configure your live interactive class</p>
                  </div>
                  <button onClick={resetForm} className="p-2 bg-stone-100 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors border-none cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Session Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold text-sm text-stone-900"
                      placeholder="e.g. Rapid Revision: Cardiovascular Pathology"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Faculty</label>
                      <input required type="text" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-3 outline-none focus:border-primary-500 transition-all font-semibold text-sm text-stone-900"
                        placeholder="Dr. Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Class Type</label>
                      <div className="relative">
                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-3 flex items-center justify-between outline-none focus:border-primary-500 transition-all font-semibold text-sm text-stone-900 text-left cursor-pointer"
                        >
                          <span>
                            {formData.liveType === 'webinar' && 'Webinar'}
                            {formData.liveType === 'interactive' && 'Interactive'}
                            {formData.liveType === 'hybrid' && 'Hybrid'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                              className="absolute z-[110] left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden"
                            >
                              {[
                                { value: 'webinar', label: 'Webinar (Broadcast)' },
                                { value: 'interactive', label: 'Interactive (Face-to-Face)' },
                                { value: 'hybrid', label: 'Hybrid (Broadcast + Q&A)' }
                              ].map((option) => (
                                <button key={option.value} type="button"
                                  onClick={() => { setFormData({ ...formData, liveType: option.value as any }); setIsDropdownOpen(false); }}
                                  className={`w-full px-4 py-3 text-left font-semibold text-sm transition-colors hover:bg-stone-50 border-none cursor-pointer ${formData.liveType === option.value ? 'bg-primary-50 text-primary-700' : 'text-stone-700'}`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Date</label>
                      <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-3 outline-none focus:border-primary-500 transition-all font-semibold text-sm text-stone-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Time</label>
                      <input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-3 outline-none focus:border-primary-500 transition-all font-semibold text-sm text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-lg font-semibold text-sm text-stone-500 hover:bg-stone-100 transition-all border-none cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all border-none cursor-pointer">
                      {isEditing ? 'Update Session' : 'Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
