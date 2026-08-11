'use client';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

export default function InstructorRevisionToolsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-12 rounded-3xl border border-gray-200 shadow-xl max-w-lg">
        <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-primary-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Revision Tools</h2>
        <p className="text-gray-500 text-lg mb-8">Configure revision tools and smart study aids for students.</p>
      </motion.div>
    </div>
  );
}
