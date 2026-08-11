'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Search } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface Discussion {
  id: string;
  question: string;
  topic: string;
  author: string;
  replies: number;
  likes: number;
  createdAt: string;
}

function McqDiscussionsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_mcq_discussions');
    if (stored) {
      try { setDiscussions(JSON.parse(stored)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_mcq_discussions', JSON.stringify(discussions));
  }, [discussions]);

  const filtered = discussions.filter(d =>
    d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="mcq-discussions">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Interactive MCQ Discussions</h1>
              <p className="text-gray-500 mt-1">Discuss MCQ questions with peers and instructors</p>
            </div>
            <button
              onClick={() => {
                const question = prompt('Enter the MCQ question:');
                if (!question) return;
                const newDiscussion: Discussion = {
                  id: Date.now().toString(),
                  question,
                  topic: prompt('Topic:') || 'General',
                  author: localStorage.getItem('currentUser') || 'Student',
                  replies: 0,
                  likes: 0,
                  createdAt: new Date().toISOString(),
                };
                setDiscussions(prev => [newDiscussion, ...prev]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> New Discussion
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold">No discussions yet</p>
                <p className="text-sm">Start a new MCQ discussion to begin</p>
              </motion.div>
            ) : (
              filtered.map((disc, i) => (
                <motion.div
                  key={disc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-1">{disc.question}</p>
                      <p className="text-sm text-gray-500">{disc.topic} &bull; by {disc.author}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{disc.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{disc.replies}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this discussion?')) {
                            setDiscussions(prev => prev.filter(d => d.id !== disc.id));
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
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
  return <McqDiscussionsPage />;
}
