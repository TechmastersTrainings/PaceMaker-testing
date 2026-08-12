'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Search, Plus, Play, Clock, CheckCircle2, Trash2, Film } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useAuth } from '@/contexts/AuthContext';

interface RevisionVideo {
  id: string;
  title: string;
  subject: string;
  duration: string;
  instructor: string;
  watched: boolean;
  videoUrl?: string;
}

function RevisionVideosPage() {
  const { user } = useAuth();
  const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'TRAINER' || user?.role === 'ADMIN';

  const [isLoaded, setIsLoaded] = useState(false);
  const [videos, setVideos] = useState<RevisionVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<RevisionVideo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lms_revision_videos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVideos(parsed);
        }
      } catch {
        setVideos([]);
      }
    } else {
      setVideos([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lms_revision_videos', JSON.stringify(videos));
    }
  }, [videos, isLoaded]);

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWatch = (id: string) => {
    setVideos(prev =>
      prev.map(v => (v.id === id ? { ...v, watched: !v.watched } : v))
    );
  };

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="revision-videos">
        <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Revision Videos</h1>
              <p className="text-sm font-medium text-stone-500 mt-0.5">High-yield rapid recap modules uploaded by instructors</p>
            </div>
            {isInstructorOrAdmin && (
              <button
                onClick={() => {
                  const title = prompt('Enter video title:');
                  if (!title) return;
                  const newVideo: RevisionVideo = {
                    id: Date.now().toString(),
                    title,
                    subject: prompt('Subject:') || 'General',
                    duration: prompt('Duration (e.g. 10 min):') || '10 min',
                    instructor: user?.name || 'Instructor',
                    watched: false,
                  };
                  setVideos(prev => [newVideo, ...prev]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" /> Add Revision Video
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search revision videos by title, subject, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Video List */}
          <div className="grid gap-3.5">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl border border-stone-200/60 p-6">
                <Repeat className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                <p className="font-bold text-stone-900">No revision videos available yet</p>
                <p className="text-sm text-stone-500">Revision videos will appear here once uploaded by an instructor.</p>
              </motion.div>
            ) : (
              filtered.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200/60 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      video.watched ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                    }`}>
                      {video.watched ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-5 h-5 fill-current" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-sm group-hover:text-primary-600 transition-colors truncate">{video.title}</h3>
                        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {video.subject}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 font-medium">Instructor: {video.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{video.duration}</span>
                    </div>

                    <button
                      onClick={() => setActiveVideo(video)}
                      className="px-4 py-2 bg-stone-900 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none inline-flex items-center gap-1.5"
                    >
                      <Film className="w-3.5 h-3.5" /> Watch
                    </button>

                    <button
                      onClick={() => toggleWatch(video.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        video.watched
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {video.watched ? 'Completed' : 'Mark Watched'}
                    </button>

                    {isInstructorOrAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete revision video "${video.title}"?`)) {
                            setVideos(prev => prev.filter(v => v.id !== video.id));
                          }
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Video Watch Modal */}
          {activeVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setActiveVideo(null)} />
              <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl z-10 text-stone-900 border border-stone-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{activeVideo.title}</h3>
                    <p className="text-xs font-semibold text-stone-400">{activeVideo.subject} &bull; {activeVideo.instructor}</p>
                  </div>
                  <button onClick={() => setActiveVideo(null)} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold border-none cursor-pointer">
                    ✕
                  </button>
                </div>
                <div className="aspect-video bg-stone-900 rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center">
                  <Play className="w-16 h-16 text-primary-400 mb-3 animate-pulse" />
                  <p className="font-bold text-lg">Revision Video Player</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-md">Playing lecture summary for {activeVideo.title}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-medium">Duration: {activeVideo.duration}</span>
                  <button
                    onClick={() => {
                      toggleWatch(activeVideo.id);
                      setActiveVideo(null);
                    }}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

export default function Page() {
  return <RevisionVideosPage />;
}
