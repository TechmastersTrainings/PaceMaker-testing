'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Search, Plus, Play, Clock, Eye } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface RevisionVideo {
  id: string;
  title: string;
  subject: string;
  duration: string;
  watched: boolean;
}

function RevisionVideosPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videos, setVideos] = useState<RevisionVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_revision_videos');
    if (stored) {
      try { setVideos(JSON.parse(stored)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_revision_videos', JSON.stringify(videos));
  }, [videos]);

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="revision-videos">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Revision Videos</h1>
              <p className="text-gray-500 mt-1">Quick recap videos for last-minute revision</p>
            </div>
            <button
              onClick={() => {
                const title = prompt('Enter video title:');
                if (!title) return;
                const newVideo: RevisionVideo = {
                  id: Date.now().toString(),
                  title,
                  subject: prompt('Subject:') || 'General',
                  duration: prompt('Duration (e.g. 10 min):') || '5 min',
                  watched: false,
                };
                setVideos(prev => [newVideo, ...prev]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> Add Video
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search revision videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-400">
                <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold">No revision videos yet</p>
                <p className="text-sm">Click &quot;Add Video&quot; to get started</p>
              </motion.div>
            ) : (
              filtered.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{video.title}</p>
                    <p className="text-sm text-gray-500">{video.subject} &bull; {video.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">{video.duration}</span>
                    <button
                      onClick={() => {
                        if (confirm('Delete this revision video?')) {
                          setVideos(prev => prev.filter(v => v.id !== video.id));
                        }
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

export default function Page() {
  return <RevisionVideosPage />;
}
