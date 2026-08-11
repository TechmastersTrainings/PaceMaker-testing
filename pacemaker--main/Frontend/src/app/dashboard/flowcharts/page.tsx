'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Search, Trash2 } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface Flowchart {
  id: string;
  title: string;
  subject: string;
  description: string;
  createdAt: string;
}

function FlowchartsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_flowcharts');
    if (stored) {
      try { setFlowcharts(JSON.parse(stored)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_flowcharts', JSON.stringify(flowcharts));
  }, [flowcharts]);

  const filtered = flowcharts.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="flowcharts">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Flowcharts</h1>
              <p className="text-gray-500 mt-1">Visual summaries for complex medical topics</p>
            </div>
            <button
              onClick={() => {
                const title = prompt('Flowchart title:');
                if (!title) return;
                const newFlowchart: Flowchart = {
                  id: Date.now().toString(),
                  title,
                  subject: prompt('Subject:') || 'General',
                  description: prompt('Description:') || '',
                  createdAt: new Date().toISOString(),
                };
                setFlowcharts(prev => [newFlowchart, ...prev]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> Add Flowchart
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search flowcharts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-12 text-gray-400">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-bold">No flowcharts yet</p>
                <p className="text-sm">Add a flowchart to visualize key concepts</p>
              </motion.div>
            ) : (
              filtered.map((fc, i) => (
                <motion.div
                  key={fc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 truncate flex-1">{fc.title}</h3>
                    <button
                      onClick={() => {
                        if (confirm('Delete this flowchart?')) {
                          setFlowcharts(prev => prev.filter(f => f.id !== fc.id));
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{fc.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{fc.description}</p>
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
  return <FlowchartsPage />;
}
