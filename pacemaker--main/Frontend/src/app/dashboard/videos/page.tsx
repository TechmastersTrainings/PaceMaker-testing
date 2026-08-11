'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Play, Lock, Search, Filter,
  ChevronRight, Calendar, Clock,
  AlertCircle, CheckCircle2, CreditCard,
  BookOpen, GraduationCap, TrendingUp,
  X, Eye, BarChart3, Layers, Film,
  Sparkles, Star, Heart, ChevronDown,
  SlidersHorizontal, ArrowUpRight, Upload,
  MoreHorizontal, Edit3, Trash2, Copy,
  Grid3X3, List, ArrowUpDown, Globe,
  Moon, Sun, Clock3, Download, Share2,
  Plus, FileVideo
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { videoService } from '@/services/videoService';
import type { VideoResponse } from '@/services/videoService';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ALL_VIDEO_SUBJECTS, SUBJECT_LABELS, subjectsForLevel } from '@/lib/videoSubjects';

const SUBJECT_GRADIENTS: Record<string, string> = {
  ANATOMY: 'from-teal-400 to-teal-600',
  PHYSIOLOGY: 'from-primary-400 to-primary-600',
  BIOCHEMISTRY: 'from-violet-400 to-violet-600',
  PATHOLOGY: 'from-emerald-400 to-emerald-600',
  PHARMACOLOGY: 'from-amber-400 to-amber-600',
  MICROBIOLOGY: 'from-rose-400 to-rose-600',
  FORENSIC_MEDICINE: 'from-stone-400 to-stone-600',
  COMMUNITY_MEDICINE: 'from-lime-400 to-lime-600',
  OPHTHALMOLOGY: 'from-indigo-400 to-indigo-600',
  ENT: 'from-cyan-400 to-cyan-600',
  MEDICINE: 'from-blue-400 to-blue-600',
  SURGERY: 'from-orange-400 to-orange-600',
  PEDIATRICS: 'from-sky-400 to-sky-600',
  ORTHOPEDICS: 'from-lime-400 to-lime-600',
  OBSTETRICS_GYNECOLOGY: 'from-pink-400 to-pink-600',
  DERMATOLOGY: 'from-fuchsia-400 to-fuchsia-600',
  PSYCHIATRY: 'from-purple-400 to-purple-600',
  RADIOLOGY: 'from-slate-400 to-slate-600',
  ANESTHESIA: 'from-gray-400 to-gray-600',
  NEET_PG: 'from-rose-500 to-rose-700',
  INI_CET: 'from-amber-500 to-amber-700',
};

const SUBJECT_BADGE_COLORS: Record<string, string> = {
  ANATOMY: 'bg-teal-100 text-teal-700 border-teal-200',
  PHYSIOLOGY: 'bg-primary-100 text-primary-700 border-primary-200',
  BIOCHEMISTRY: 'bg-violet-100 text-violet-700 border-violet-200',
  PATHOLOGY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PHARMACOLOGY: 'bg-amber-100 text-amber-700 border-amber-200',
  MICROBIOLOGY: 'bg-rose-100 text-rose-700 border-rose-200',
  FORENSIC_MEDICINE: 'bg-stone-100 text-stone-700 border-stone-200',
  COMMUNITY_MEDICINE: 'bg-lime-100 text-lime-700 border-lime-200',
  OPHTHALMOLOGY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ENT: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  MEDICINE: 'bg-blue-100 text-blue-700 border-blue-200',
  SURGERY: 'bg-orange-100 text-orange-700 border-orange-200',
  PEDIATRICS: 'bg-sky-100 text-sky-700 border-sky-200',
  ORTHOPEDICS: 'bg-lime-100 text-lime-700 border-lime-200',
  OBSTETRICS_GYNECOLOGY: 'bg-pink-100 text-pink-700 border-pink-200',
  DERMATOLOGY: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  PSYCHIATRY: 'bg-purple-100 text-purple-700 border-purple-200',
  RADIOLOGY: 'bg-slate-100 text-slate-700 border-slate-200',
  ANESTHESIA: 'bg-gray-100 text-gray-700 border-gray-200',
  NEET_PG: 'bg-rose-100 text-rose-700 border-rose-200',
  INI_CET: 'bg-amber-100 text-amber-700 border-amber-200',
};

const ALL_CATEGORIES = 'ALL';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
});

function StudentVideosPage() {
  const { canAccess, loading: subLoading } = useSubscription();
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<Record<string, { total: number; completed: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [academicLevelFilter, setAcademicLevelFilter] = useState<string[] | null>(null);

  useEffect(() => {
    const levelId = localStorage.getItem('academicLevelId') || '';
    if (levelId) {
      const levelSubjects = subjectsForLevel(levelId);
      if (levelSubjects.length > 0) setAcademicLevelFilter(levelSubjects);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoResponse | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoResponse | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editInstructor, setEditInstructor] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isSubscribed = canAccess('videos');

  useEffect(() => {
    if (subLoading) return;
    if (!isSubscribed) { setIsLoading(false); return; }
    async function loadVideos() {
      try {
        const [dbVideos, progress] = await Promise.all([
          videoService.getAllVideos(),
          videoService.getCategoryProgress(),
        ]);
        const filtered = dbVideos.filter(v => !v.title?.toLowerCase().startsWith('live recording:'));
        const byLevel = academicLevelFilter
          ? filtered.filter(v => academicLevelFilter.includes(v.category))
          : filtered;
        setVideos(byLevel);
        const progressMap: Record<string, { total: number; completed: number }> = {};
        progress.forEach((p: { category: string; totalVideos: number; completedVideos: number }) => {
          progressMap[p.category] = { total: p.totalVideos, completed: p.completedVideos };
        });
        setCategoryProgress(progressMap);
      } catch (e) {
        console.error("Failed to load videos", e);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadVideos();
  }, [subLoading, academicLevelFilter]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(videos.map(v => v.category));
    return Array.from(cats).sort();
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let result = videos.filter(v => {
      const matchesSearch = searchQuery === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.tags || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === ALL_CATEGORIES || v.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    switch (sortBy) {
      case 'newest': result = result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()); break;
      case 'oldest': result = result.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()); break;
      case 'az': result = result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za': result = result.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    return result;
  }, [videos, searchQuery, selectedCategory, sortBy]);

  const handleWatchClick = (video: VideoResponse) => {
    if (!isSubscribed) {
      setSelectedVideo(video);
      setShowPaywall(true);
      return;
    }
    router.push(`/dashboard/videos/${video.id}`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadPanel(true);
    setIsUploading(true);
    setUploadProgress(0);
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);
    setTimeout(async () => {
      clearInterval(timer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setShowUploadPanel(false);
        setUploadProgress(0);
        loadVideos();
      }, 800);
    }, 3000);
  };

  const loadVideos = async () => {
    try {
      const [dbVideos, progress] = await Promise.all([
        videoService.getAllVideos(),
        videoService.getCategoryProgress(),
      ]);
      const filtered = dbVideos.filter((v: VideoResponse) => !v.title?.toLowerCase().startsWith('live recording:'));
      const byLevel = academicLevelFilter
        ? filtered.filter(v => academicLevelFilter.includes(v.category))
        : filtered;
      setVideos(byLevel);
      const progressMap: Record<string, { total: number; completed: number }> = {};
      progress.forEach((p: { category: string; totalVideos: number; completedVideos: number }) => {
        progressMap[p.category] = { total: p.totalVideos, completed: p.completedVideos };
      });
      setCategoryProgress(progressMap);
    } catch (e) {
      console.error("Failed to load videos", e);
    }
  };

  const handleEditOpen = (video: VideoResponse) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description || '');
    setEditCategory(video.category || '');
    setEditInstructor(video.instructor || '');
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleEditSave = async () => {
    if (!editingVideo) return;
    try {
      await videoService.updateVideo(editingVideo.id, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        instructor: editInstructor,
      });
      setShowEditModal(false);
      setEditingVideo(null);
      await loadVideos();
    } catch (err) {
      console.error("Failed to update video", err);
    }
  };

  const handleDeleteVideo = async (video: VideoResponse) => {
    setOpenMenuId(null);
    if (!confirm(`Delete "${video.title}"?`)) return;
    try {
      await videoService.deleteVideo(video.id);
      await loadVideos();
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  const totalCompleted = useMemo(() =>
    Object.values(categoryProgress).reduce((sum, p) => sum + p.completed, 0),
  [categoryProgress]);

  const totalVideos = useMemo(() =>
    Object.values(categoryProgress).reduce((sum, p) => sum + p.total, 0),
  [categoryProgress]);

  const completionPct = totalVideos > 0 ? Math.round((totalCompleted / totalVideos) * 100) : 0;

  const getStatusBadge = (video: VideoResponse) => {
    const access = video.accessLevel;
    if (access === 'free') return { label: 'Free', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (access === 'premium') return { label: 'Premium', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: access || 'Standard', color: 'bg-stone-100 text-stone-600 border-stone-200' };
  };

  // --- Loading State ---
  if (isLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-stone-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            <Film className="absolute inset-0 m-auto w-6 h-6 text-primary-500" />
          </div>
          <p className="text-stone-500 font-bold font-mono uppercase tracking-[0.2em] text-xs">Loading Library...</p>
        </div>
      </div>
    );
  }

  // --- Paywall State ---
  if (!isSubscribed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-primary-50 to-primary-100 rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-primary-200 shadow-lg shadow-primary-500/10">
            <Film className="w-14 h-14 text-primary-500" />
          </div>
          <h1 className="text-5xl font-black text-stone-900 tracking-tight mb-4 leading-tight">
            Video Library is <br />
            <span className="text-primary-600">Pro Only</span>
          </h1>
          <p className="text-lg text-stone-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
            Upgrade your plan to access premium medical lectures and clinical modules from top faculty.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary-600/30 hover:scale-105 active:scale-95"
          >
            Become a Pro User <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-16">

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Video Library</h1>
            <p className="text-sm text-stone-400 font-medium">{videos.length} modules &bull; {categories.length} categories</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer border-none"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
        </div>
      </motion.div>

      {/* ── Upload Progress Panel ── */}
      <AnimatePresence>
        {showUploadPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {isUploading ? 'Uploading video...' : 'Upload complete'}
                  </p>
                  <span className="text-xs font-bold text-primary-600">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <button
                onClick={() => { setShowUploadPanel(false); setIsUploading(false); }}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeUp(0.05)} className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
              <Film className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Total Videos</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{totalVideos || videos.length}</p>
        </motion.div>
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{totalCompleted}</p>
        </motion.div>
        <motion.div {...fadeUp(0.15)} className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Categories</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{categories.length}</p>
        </motion.div>
        <motion.div {...fadeUp(0.2)} className="bg-white rounded-xl border border-stone-200/50 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-stone-900">{completionPct}%</p>
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden max-w-[80px]">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Toolbar: Search + Filters + Sort + View Toggle ── */}
      <motion.div {...fadeUp(0.1)} className="bg-white rounded-xl border border-stone-200/50 shadow-sm">
        <div className="p-4 space-y-3">
          {/* Row 1: Search + Sort + View */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by title, instructor, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-9 py-2 text-sm text-stone-900 placeholder:text-stone-400 font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-stone-200 rounded-full transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-stone-700 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>
              <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all border-none cursor-pointer ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all border-none cursor-pointer ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSelectedCategory(ALL_CATEGORIES)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCategory === ALL_CATEGORIES
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
              }`}
            >All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? `${SUBJECT_BADGE_COLORS[cat] || 'bg-stone-900 text-white'} border-current shadow-sm`
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                }`}
              >{SUBJECT_LABELS[cat] || cat}</button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Results Header ── */}
      <motion.div {...fadeUp(0.15)} className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-400">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          {selectedCategory !== ALL_CATEGORIES && ` in ${SUBJECT_LABELS[selectedCategory] || selectedCategory}`}
        </p>
      </motion.div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {filteredVideos.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mb-5 border border-stone-100">
              <Search className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No videos found</h3>
            <p className="text-sm text-stone-500 font-medium max-w-sm">
              {searchQuery ? `No videos match "${searchQuery}". Try a different search term.` : 'No videos are available in this category yet.'}
            </p>
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(ALL_CATEGORIES); }}
                className="mt-6 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer border-none"
              >Clear Filters</button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredVideos.map((video, idx) => {
              const cat = video.category;
              const gradient = SUBJECT_GRADIENTS[cat] || 'from-stone-400 to-stone-600';
              const badgeColor = SUBJECT_BADGE_COLORS[cat] || 'bg-stone-100 text-stone-600 border-stone-200';
              const status = getStatusBadge(video);
              return (
                <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className="group bg-white rounded-xl border border-stone-200/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                    </div>
                    <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${badgeColor}`}>
                        {SUBJECT_LABELS[cat] || cat}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-md text-[10px] font-bold text-white shadow-sm">
                        {video.duration ? `${Math.floor(video.duration / 60)}m` : '15m'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center z-10">
                      <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-6 h-6 text-stone-900 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2 flex-1">
                        {video.title}
                      </h3>
                      <div className="relative shrink-0" ref={openMenuId === String(video.id) ? menuRef : undefined}>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === String(video.id) ? null : String(video.id)); }}
                          className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === String(video.id) && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-stone-200 shadow-xl z-20 py-1 overflow-hidden"
                            >
                              <button onClick={() => handleWatchClick(video)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-primary-50 hover:text-primary-600 transition-colors border-none bg-transparent cursor-pointer text-left"
                              ><Play className="w-3.5 h-3.5" /> Watch</button>
                              <button onClick={() => handleEditOpen(video)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-primary-50 hover:text-primary-600 transition-colors border-none bg-transparent cursor-pointer text-left"
                              ><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                              <button onClick={() => handleDeleteVideo(video)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left"
                              ><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs font-medium text-stone-400">
                      {video.instructor && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{video.instructor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{video.duration ? `${Math.floor(video.duration / 60)}m` : '15m'}</span>
                      </div>
                      {video.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {categoryProgress[cat] && categoryProgress[cat].total > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 mb-1">
                          <span>{categoryProgress[cat].completed}/{categoryProgress[cat].total} watched</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                            style={{ width: `${Math.round((categoryProgress[cat].completed / categoryProgress[cat].total) * 100)}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto flex gap-2">
                      <button onClick={() => handleWatchClick(video)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all bg-stone-900 hover:bg-primary-600 text-white shadow-sm hover:shadow-md cursor-pointer border-none"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Watch
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ── List View ── */
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-stone-200/50 shadow-sm overflow-hidden"
          >
            {filteredVideos.map((video, idx) => {
              const cat = video.category;
              const gradient = SUBJECT_GRADIENTS[cat] || 'from-stone-400 to-stone-600';
              const badgeColor = SUBJECT_BADGE_COLORS[cat] || 'bg-stone-100 text-stone-600 border-stone-200';
              const status = getStatusBadge(video);
              return (
                <div key={video.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition-colors ${idx < filteredVideos.length - 1 ? 'border-b border-stone-100' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white/80 fill-current" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-stone-900 truncate">{video.title}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                        {SUBJECT_LABELS[cat] || cat}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      {video.instructor && <span>{video.instructor}</span>}
                      <span>{video.duration ? `${Math.floor(video.duration / 60)}m` : '15m'}</span>
                      {video.createdAt && <span>{new Date(video.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleWatchClick(video)}
                      className="p-2 text-stone-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="Watch"
                    ><Play className="w-4 h-4" /></button>
                    <button onClick={() => handleEditOpen(video)}
                      className="p-2 text-stone-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="Edit"
                    ><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteVideo(video)}
                      className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                      title="Delete"
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-[#060f1a]/85 backdrop-blur-md"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-stone-200 z-10 text-stone-900"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Edit Video</h2>
                    <p className="text-sm text-stone-400 font-medium">Update video details</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)}
                    className="p-2 bg-stone-100 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors border-none cursor-pointer"
                  ><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Title</label>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Description</label>
                    <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Category</label>
                      <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      >
                        {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Instructor</label>
                      <input type="text" value={editInstructor} onChange={(e) => setEditInstructor(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200/60 rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-5 mt-5 border-t border-stone-100">
                  <button onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-stone-500 hover:bg-stone-100 transition-all border-none cursor-pointer"
                  >Cancel</button>
                  <button onClick={handleEditSave}
                    className="flex-[2] py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm border-none cursor-pointer"
                  >Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Paywall Modal ── */}
      <AnimatePresence>
        {showPaywall && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaywall(false)}
              className="absolute inset-0 bg-[#060f1a]/85 backdrop-blur-md"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-xl p-6 relative z-10 shadow-xl border border-stone-200 text-stone-900"
            >
              <div className="flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100">
                  <Lock className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900 mb-2">Premium Content</h2>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">
                    Subscribe to PaceMaker to watch this video and access the full library.
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2.5">
                  <Link href="/pricing"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >View Plans <ChevronRight className="w-4 h-4" /></Link>
                  <button onClick={() => setShowPaywall(false)}
                    className="w-full py-2.5 text-stone-400 hover:text-stone-600 text-sm font-semibold transition-colors bg-transparent border-none cursor-pointer"
                  >Maybe Later</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function StudentVideosPageWithError() {
  return (
    <ErrorBoundary>
      <StudentVideosPage />
    </ErrorBoundary>
  );
}
