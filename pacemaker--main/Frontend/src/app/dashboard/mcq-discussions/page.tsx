'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Search, Trash2, Eye } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useAuth } from '@/contexts/AuthContext';

interface Discussion {
  id: string;
  question: string;
  topic: string;
  author: string;
  replies: number;
  likes: number;
  userLiked?: boolean;
  explanation?: string;
  createdAt: string;
}

const DEFAULT_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-1',
    question: 'A 45-year-old male presents with sudden retrosternal chest pain radiating to left arm. ST elevation in leads II, III, aVF. What is the culprit artery?',
    topic: 'CARDIOLOGY',
    author: 'Dr. Aman Gupta (Faculty)',
    replies: 18,
    likes: 42,
    explanation: 'Inferior wall MI with ST elevation in II, III, aVF is most commonly caused by occlusion of the Right Coronary Artery (RCA).',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'disc-2',
    question: 'Which antibiotic is considered first-line for uncomplicated lower urinary tract infection in non-pregnant females?',
    topic: 'PHARMACOLOGY',
    author: 'Dr. Neha Sharma (Faculty)',
    replies: 12,
    likes: 29,
    explanation: 'Nitrofurantoin or Fosfomycin / Trimethoprim-Sulfamethoxazole are first-line options for uncomplicated cystitis.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'disc-3',
    question: 'What is the characteristic histological finding on renal biopsy in Minimal Change Disease?',
    topic: 'PATHOLOGY',
    author: 'Dr. Rajesh V (Faculty)',
    replies: 24,
    likes: 56,
    explanation: 'Normal appearance under light microscopy; electron microscopy reveals effacement of visceral epithelial cell foot processes.',
    createdAt: new Date().toISOString(),
  },
];

function McqDiscussionsPage() {
  const { user } = useAuth();
  const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'TRAINER' || user?.role === 'ADMIN';

  const [isLoaded, setIsLoaded] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lms_mcq_discussions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDiscussions(parsed);
        } else {
          setDiscussions(DEFAULT_DISCUSSIONS);
        }
      } catch {
        setDiscussions(DEFAULT_DISCUSSIONS);
      }
    } else {
      setDiscussions(DEFAULT_DISCUSSIONS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lms_mcq_discussions', JSON.stringify(discussions));
    }
  }, [discussions, isLoaded]);

  const filtered = discussions.filter(d =>
    d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLike = (id: string) => {
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === id) {
          const userLiked = !d.userLiked;
          return {
            ...d,
            userLiked,
            likes: userLiked ? d.likes + 1 : d.likes - 1,
          };
        }
        return d;
      })
    );
  };

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="mcq-discussions">
        <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Interactive MCQ Discussions</h1>
              <p className="text-sm font-medium text-stone-500 mt-0.5">Faculty-curated clinical MCQ breakdowns and expert discussions</p>
            </div>
            {isInstructorOrAdmin && (
              <button
                onClick={() => {
                  const question = prompt('Enter the MCQ question:');
                  if (!question) return;
                  const newDiscussion: Discussion = {
                    id: Date.now().toString(),
                    question,
                    topic: prompt('Topic:') || 'General',
                    author: user?.name || 'Instructor',
                    replies: 0,
                    likes: 0,
                    explanation: prompt('Explanation:') || '',
                    createdAt: new Date().toISOString(),
                  };
                  setDiscussions(prev => [newDiscussion, ...prev]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" /> Post New MCQ Discussion
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search MCQ discussions by question, topic, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Discussions List */}
          <div className="grid gap-3.5">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl border border-stone-200/60 p-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                <p className="font-bold text-stone-900">No discussions found</p>
                <p className="text-sm text-stone-500">Try searching for a different medical topic</p>
              </motion.div>
            ) : (
              filtered.map((disc, i) => (
                <motion.div
                  key={disc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 bg-white rounded-2xl border border-stone-200/60 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {disc.topic}
                        </span>
                        <span className="text-xs font-medium text-stone-400">posted by {disc.author}</span>
                      </div>
                      <p className="font-bold text-stone-900 text-base leading-relaxed">{disc.question}</p>
                      {disc.explanation && (
                        <p className="text-xs text-stone-500 mt-2 bg-stone-50 p-3 rounded-xl border border-stone-100 line-clamp-2">
                          <strong className="text-stone-700">Explanation:</strong> {disc.explanation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                      <button
                        onClick={() => toggleLike(disc.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          disc.userLiked
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{disc.likes}</span>
                      </button>

                      <button
                        onClick={() => setSelectedDiscussion(disc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Breakdown
                      </button>

                      {isInstructorOrAdmin && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this MCQ discussion?')) {
                              setDiscussions(prev => prev.filter(d => d.id !== disc.id));
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Discussion Modal */}
          {selectedDiscussion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDiscussion(null)} />
              <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl z-10 text-stone-900 border border-stone-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {selectedDiscussion.topic}
                    </span>
                    <h3 className="font-bold text-base text-stone-900 mt-1">MCQ Discussion & Breakdown</h3>
                  </div>
                  <button onClick={() => setSelectedDiscussion(null)} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold border-none cursor-pointer">
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Question</p>
                    <p className="text-stone-900 font-bold text-sm leading-relaxed">{selectedDiscussion.question}</p>
                  </div>
                  <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-200/60">
                    <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">Faculty Clinical Explanation</p>
                    <p className="text-stone-800 text-xs leading-relaxed font-medium">
                      {selectedDiscussion.explanation || 'Detailed high-yield clinical rationale provided by faculty instructor.'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Author: {selectedDiscussion.author}</span>
                  <button
                    onClick={() => setSelectedDiscussion(null)}
                    className="px-4 py-2 bg-stone-900 hover:bg-primary-600 text-white rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
                  >
                    Done Reading
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
  return <McqDiscussionsPage />;
}
