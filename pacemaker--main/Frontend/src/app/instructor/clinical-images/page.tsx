'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Search, Trash2, ExternalLink } from 'lucide-react';

interface ClinicalImage { id: string; title: string; subject: string; url: string; description: string; }

export default function InstructorClinicalImagesPage() {
  const [images, setImages] = useState<ClinicalImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lms_instructor_clinical_images');
    if (stored) { try { setImages(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('lms_instructor_clinical_images', JSON.stringify(images));
  }, [images]);

  const filtered = images.filter(img =>
    img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Clinical Images</h1>
          <p className="text-gray-500 mt-1">Manage clinical image library</p>
        </div>
        <button onClick={() => {
          const title = prompt('Image title:'); if (!title) return;
          const url = prompt('Image URL:'); if (!url) return;
          setImages(prev => [...prev, { id: Date.now().toString(), title, subject: prompt('Subject:') || 'General', url, description: prompt('Description:') || '' }]);
        }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/e2e8f0/94a3b8?text=Image'; }} />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{img.title}</h3>
                  <p className="text-xs text-gray-400">{img.subject}</p>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <a href={img.url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-primary-600"><ExternalLink className="w-3.5 h-3.5" /></a>
                  <button onClick={() => { if (confirm('Delete?')) setImages(prev => prev.filter(x => x.id !== img.id)); }}
                    className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {img.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{img.description}</p>}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-bold">No clinical images yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
