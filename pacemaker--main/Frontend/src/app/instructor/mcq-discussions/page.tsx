'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Search, ThumbsUp, Trash2 } from 'lucide-react';

interface Discussion {
  id: string; question: string; topic: string; author: string; likes: number;
}

export default function InstructorMcqDiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_instructor_mcq_discussions');
    if (stored) { try { setDiscussions(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_instructor_mcq_discussions', JSON.stringify(discussions));
  }, [discussions]);

  const filtered = discussions.filter(d =>
    d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">MCQ Discussions</h1>
          <p className="text-gray-500 mt-1">Manage interactive MCQ discussion threads</p>
        </div>
        <button onClick={() => {
          const q = prompt('MCQ question:'); if (!q) return;
          setDiscussions(prev => [...prev, { id: Date.now().toString(), question: q, topic: prompt('Topic:') || 'General', author: 'Instructor', likes: 0 }]);
        }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm">
          <Plus className="w-4 h-4" /> New Discussion
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>
      <div className="grid gap-3">
        {filtered.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 mb-1">{d.question}</p>
                <p className="text-sm text-gray-500">{d.topic} &bull; by {d.author}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-sm text-gray-400"><ThumbsUp className="w-4 h-4" />{d.likes}</span>
                <button onClick={() => { if (confirm('Delete?')) setDiscussions(prev => prev.filter(x => x.id !== d.id)); }}
                  className="p-1 text-red-400 hover:text-red-600 text-xs">Delete</button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-bold">No discussions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
