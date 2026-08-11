'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Plus, Search, Play, Trash2 } from 'lucide-react';

interface RevisionVideo {
  id: string;
  title: string;
  subject: string;
  duration: string;
}

export default function InstructorRevisionVideosPage() {
  const [videos, setVideos] = useState<RevisionVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_instructor_revision_videos');
    if (stored) { try { setVideos(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_instructor_revision_videos', JSON.stringify(videos));
  }, [videos]);

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Revision Videos</h1>
          <p className="text-gray-500 mt-1">Manage revision video content for students</p>
        </div>
        <button
          onClick={() => {
            const title = prompt('Video title:'); if (!title) return;
            setVideos(prev => [...prev, { id: Date.now().toString(), title, subject: prompt('Subject:') || 'General', duration: prompt('Duration:') || '5 min' }]);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="grid gap-3">
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{v.title}</p>
              <p className="text-sm text-gray-500">{v.subject} &bull; {v.duration}</p>
            </div>
            <button onClick={() => { if (confirm('Delete?')) setVideos(prev => prev.filter(x => x.id !== v.id)); }}
              className="p-1.5 text-red-400 hover:text-red-600 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-bold">No revision videos</p>
          </div>
        )}
      </div>
    </div>
  );
}
