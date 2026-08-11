'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Search, Trash2, Eye, ExternalLink, X } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useAuth } from '@/contexts/AuthContext';

interface ClinicalImage {
  id: string;
  title: string;
  subject: string;
  url: string;
  description: string;
  keyFindings?: string;
  createdAt: string;
}

const DEFAULT_CLINICAL_IMAGES: ClinicalImage[] = [
  {
    id: 'img-1',
    title: 'Chest X-Ray: Right Middle Lobe Pneumonia',
    subject: 'RADIOLOGY',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    description: 'PA Chest Radiograph demonstrating classic lobar consolidation in the right middle lobe with silhouette sign along right heart border.',
    keyFindings: 'Homogenous opacity in RML, Loss of right cardiac border definition, Air bronchograms visible.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-2',
    title: 'Fundoscopy: Non-Proliferative Diabetic Retinopathy',
    subject: 'OPHTHALMOLOGY',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    description: 'Retinal photography exhibiting microaneurysms, dot-and-blot hemorrhages, and hard exudates in the macular region.',
    keyFindings: 'Microaneurysms, Hard exudates (lipid deposits), Cotton wool spots.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-3',
    title: 'Peripheral Blood Smear: Iron Deficiency Anemia',
    subject: 'PATHOLOGY',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    description: 'High-power light microscopy of peripheral blood smear showing marked microcytic hypochromic RBCs with central pallor > 1/3 diameter.',
    keyFindings: 'Hypochromic RBCs, Anisopoikilocytosis, Pencil/cigar cells.',
    createdAt: new Date().toISOString(),
  },
];

function ClinicalImagesPage() {
  const { user } = useAuth();
  const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'TRAINER' || user?.role === 'ADMIN';

  const [isLoaded, setIsLoaded] = useState(false);
  const [images, setImages] = useState<ClinicalImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImage, setActiveImage] = useState<ClinicalImage | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lms_clinical_images');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(parsed);
        } else {
          setImages(DEFAULT_CLINICAL_IMAGES);
        }
      } catch {
        setImages(DEFAULT_CLINICAL_IMAGES);
      }
    } else {
      setImages(DEFAULT_CLINICAL_IMAGES);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lms_clinical_images', JSON.stringify(images));
    }
  }, [images, isLoaded]);

  const filtered = images.filter(img =>
    img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="clinical-images">
        <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Clinical Images Library</h1>
              <p className="text-sm font-medium text-stone-500 mt-0.5">High-resolution medical imaging and diagnostic clinical references</p>
            </div>
            {isInstructorOrAdmin && (
              <button
                onClick={() => {
                  const title = prompt('Image title:');
                  if (!title) return;
                  const url = prompt('Image URL:');
                  if (!url) return;
                  const newImage: ClinicalImage = {
                    id: Date.now().toString(),
                    title,
                    subject: prompt('Subject:') || 'General',
                    url,
                    description: prompt('Description:') || '',
                    keyFindings: prompt('Key Findings:') || '',
                    createdAt: new Date().toISOString(),
                  };
                  setImages(prev => [newImage, ...prev]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" /> Add Clinical Image
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search clinical images by title, specialty, or diagnostic findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Image Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white rounded-2xl border border-stone-200/60 p-6">
                <Image className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                <p className="font-bold text-stone-900">No clinical images found</p>
                <p className="text-sm text-stone-500">Try searching for a different image topic</p>
              </motion.div>
            ) : (
              filtered.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-video bg-stone-900 relative overflow-hidden group cursor-pointer" onClick={() => setActiveImage(img)}>
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View High-Res</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {img.subject}
                        </span>
                        {isInstructorOrAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete image "${img.title}"?`)) {
                                setImages(prev => prev.filter(x => x.id !== img.id));
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm leading-snug mb-1">{img.title}</h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">{img.description}</p>
                    </div>

                    <button
                      onClick={() => setActiveImage(img)}
                      className="w-full py-2 bg-stone-900 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none inline-flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Image & Findings
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* High Res Modal */}
          {activeImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveImage(null)} />
              <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl z-10 text-stone-900 border border-stone-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {activeImage.subject}
                    </span>
                    <h3 className="font-bold text-lg text-stone-900 mt-1">{activeImage.title}</h3>
                  </div>
                  <button onClick={() => setActiveImage(null)} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold border-none cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="aspect-video bg-stone-950 rounded-2xl overflow-hidden mb-4 border border-stone-800">
                  <img
                    src={activeImage.url}
                    alt={activeImage.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-xs text-stone-800 font-medium leading-relaxed">{activeImage.description}</p>
                  </div>

                  {activeImage.keyFindings && (
                    <div className="bg-primary-50/60 p-3.5 rounded-2xl border border-primary-200/60">
                      <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">Diagnostic Key Findings</p>
                      <p className="text-xs text-stone-900 font-semibold leading-relaxed">{activeImage.keyFindings}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => setActiveImage(null)}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-primary-600 text-white rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
                  >
                    Close Viewer
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
  return <ClinicalImagesPage />;
}
