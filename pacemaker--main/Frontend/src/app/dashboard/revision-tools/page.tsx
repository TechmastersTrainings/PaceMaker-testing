'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Timer, Target, Shuffle, BookOpen } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface ToolCard {
  icon: any;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}

function RevisionToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools: ToolCard[] = [
    {
      icon: Timer,
      title: 'Quick Quiz',
      description: 'Generate a timed 10-question quiz from random topics',
      action: 'Start Quiz',
      onClick: () => setActiveTool('quiz'),
    },
    {
      icon: Target,
      title: 'Weak Topic Finder',
      description: 'Identify your weak areas based on past performance',
      action: 'Analyze',
      onClick: () => setActiveTool('weakness'),
    },
    {
      icon: Shuffle,
      title: 'Random Flash Cards',
      description: 'Review key concepts with randomized flash cards',
      action: 'Review',
      onClick: () => setActiveTool('flashcards'),
    },
    {
      icon: BookOpen,
      title: 'Study Planner',
      description: 'Generate an optimized study schedule based on your syllabus',
      action: 'Plan',
      onClick: () => setActiveTool('planner'),
    },
  ];

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="revision-tools">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Revision Tools</h1>
            <p className="text-gray-500 mt-1">Smart tools to accelerate your exam preparation</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <tool.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
                <button
                  onClick={tool.onClick}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm"
                >
                  {tool.action}
                </button>
              </motion.div>
            ))}
          </div>

          {activeTool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-gray-900">
                  {activeTool === 'quiz' ? 'Quick Quiz' :
                   activeTool === 'weakness' ? 'Weak Topic Analysis' :
                   activeTool === 'flashcards' ? 'Flash Cards' : 'Study Planner'}
                </h3>
                <button
                  onClick={() => setActiveTool(null)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="text-center py-8 text-gray-400">
                <Wrench className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">This tool will be available soon</p>
                <p className="text-sm">We&apos;re building advanced revision features</p>
              </div>
            </motion.div>
          )}
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

export default function Page() {
  return <RevisionToolsPage />;
}
