'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, UploadCloud, Info, CheckCircle2, Film, Loader2, X, Play, Trash2, ArrowLeft, ChevronDown, Lock, Tag, Clock, Globe, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoService } from '@/services/videoService';

import { AdminTableSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ALL_VIDEO_SUBJECTS, SUBJECT_VALUES, SUBJECT_LABELS } from '@/lib/videoSubjects';

export default function InstructorVideosPagePage() {
  return (
    <ErrorBoundary>
      <InstructorVideosPage />
    </ErrorBoundary>
  );
}

function InstructorVideosPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [subject, setSubject] = useState('Anatomy');
  const [accessLevel, setAccessLevel] = useState('FREE');
  const [duration, setDuration] = useState('15');
  const [assetId, setAssetId] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300');

  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<{title: string, videoUrl: string} | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', subject: '', accessLevel: '', tags: '', instructor: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSubjectOpen, setEditSubjectOpen] = useState(false);
  const [editAccessOpen, setEditAccessOpen] = useState(false);

  // Load videos from DB and filter by current instructor
  const loadVideosFromDb = async () => {
    try {
      const dbVideos = await videoService.getAllVideos();
      const currentUser = localStorage.getItem('currentUser') || '';
      const userRole = localStorage.getItem('userRole') || '';

      const filtered = dbVideos.filter((vid: any) => {
        if (userRole === 'admin') return true;
        if (!vid.instructor) return false;
        return vid.instructor.toLowerCase() === currentUser.toLowerCase();
      });

      const mapped = filtered.map((vid: any) => ({
        id: String(vid.id),
        title: vid.title,
        status: 'Ready to stream',
        videoUrl: vid.videoUrl,
        instructor: vid.instructor || 'Unknown',
        subject: vid.subject || vid.category || 'Anatomy',
        tags: vid.tags || '',
        description: vid.description || '',
        accessLevel: vid.accessLevel || 'FREE',
      }));
      setRecentVideos(mapped);
    } catch (err) {
      console.error("Failed to load videos from backend database:", err);
      setRecentVideos([]);
    }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || 'Dr. Jane Doe';
    setInstructor(currentUser);

    const randomId = Math.random().toString(36).substring(2, 11);
    setAssetId(`ast_${randomId}`);
    setUploadUrl(`https://wistia.com/medias/embed_${randomId}`);

    const initLoad = async () => {
      await loadVideosFromDb();
      setIsLoaded(true);
    };
    initLoad();
  }, []);

  const regenerateIds = () => {
    const randomId = Math.random().toString(36).substring(2, 11);
    setAssetId(`ast_${randomId}`);
    setUploadUrl(`https://wistia.com/medias/embed_${randomId}`);
  };

  const handlePublish = async () => {
    if (!isUploadComplete || !currentFile) return;
    setIsPublishing(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title || 'New Uploaded Video');
      formData.append('description', description || 'No description');
      formData.append('category', SUBJECT_VALUES[subject] || subject.toUpperCase());
      formData.append('accessLevel', accessLevel);
      formData.append('tags', tags || 'medical, lecture');
      formData.append('subject', subject);
      formData.append('assetId', assetId);
      formData.append('uploadUrl', uploadUrl);
      formData.append('instructor', instructor);
      
      const durationSeconds = (parseInt(duration, 10) || 15) * 60;
      formData.append('duration', String(durationSeconds));
      formData.append('thumbnailUrl', thumbnailUrl);
      formData.append('file', currentFile);

      await videoService.uploadVideo(formData);
      
      setTitle('');
      setTags('');
      setDuration('15');
      setDescription('');
      setIsUploadComplete(false);
      setUploadKey(prev => prev + 1);
      setCurrentFile(null);
      setIsPublishing(false);
      
      regenerateIds();
      await loadVideosFromDb();
      alert('Video published and saved to database successfully!');
    } catch (err) {
      console.error("Storage failed", err);
      alert("Failed to save video to database server.");
      setIsPublishing(false);
    }
  };
  
  const handlePlayVideo = (video: any) => {
    setVideoError(false);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const apiHost = process.env.NEXT_PUBLIC_API_URL || (isLocal ? 'http://localhost:8080' : '');
    const fullUrl = video.videoUrl.startsWith('http') ? video.videoUrl : `${apiHost}${video.videoUrl}`;
    setPlayingVideo({ title: video.title, videoUrl: fullUrl });
  };

  const handleDeleteVideo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this video permanently?')) {
      try {
        await videoService.deleteVideo(Number(id));
        await loadVideosFromDb();
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete video.");
      }
    }
  };

  const handleEditVideo = (e: React.MouseEvent, video: any) => {
    e.stopPropagation();
    setEditingVideo(video);
    setEditForm({
      title: video.title || '',
      description: video.description || '',
      subject: video.subject || 'Anatomy',
      accessLevel: video.accessLevel || 'FREE',
      tags: video.tags || '',
      instructor: video.instructor || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;
    setIsSavingEdit(true);
    try {
      await videoService.updateVideo(Number(editingVideo.id), {
        title: editForm.title,
        description: editForm.description,
        category: SUBJECT_VALUES[editForm.subject] || editForm.subject.toUpperCase(),
        accessLevel: editForm.accessLevel,
        tags: editForm.tags,
        subject: editForm.subject,
        instructor: editForm.instructor,
      });
      setShowEditModal(false);
      setEditingVideo(null);
      await loadVideosFromDb();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update video.");
    } finally {
      setIsSavingEdit(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4 border border-[#0D9488]/20">
          <Film className="w-4 h-4" /> Instructor Content Studio
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Video Management</h1>
        <p className="text-gray-500 mt-2">Upload clinical lectures and manage student access permissions directly from your logged-in profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#0D9488]/10 rounded-full blur-3xl z-0"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#0D9488]" />
                Upload New Module
              </h2>
              
              <div className="space-y-6 mb-8">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 font-medium outline-none" 
                    placeholder="e.g., Introduction to Cardiology - Part 1" 
                  />
                </div>
                
                {/* Subject & Instructor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Subject Category dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject Category</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all flex items-center justify-between text-gray-900 font-medium outline-none"
                      >
                        <span>{subject}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isSubjectDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSubjectDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-150 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                            >
                              {ALL_VIDEO_SUBJECTS.map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => {
                                    setSubject(s.label);
                                    setIsSubjectDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-[#0D9488]/5 ${subject === s.label ? 'bg-[#0D9488]/10 text-[#0D9488] font-bold' : 'text-gray-700'}`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Locked Instructor Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Instructor (Auto-locked)</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={instructor}
                        readOnly
                        disabled
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-bold select-none cursor-not-allowed outline-none" 
                      />
                      <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-4" />
                    </div>
                  </div>
                </div>

                {/* Access Level & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Access Level Dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-gray-400" /> Access Level
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all flex items-center justify-between text-gray-900 font-medium outline-none"
                      >
                        <span>{accessLevel}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAccessDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isAccessDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsAccessDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-150 overflow-hidden"
                            >
                              {['FREE', 'BASIC', 'MEDIUM', 'HIGH'].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => {
                                    setAccessLevel(lvl);
                                    setIsAccessDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-[#0D9488]/5 ${accessLevel === lvl ? 'bg-[#0D9488]/10 text-[#0D9488] font-bold' : 'text-gray-700'}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" /> Duration (Minutes)
                    </label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 font-medium outline-none" 
                      placeholder="e.g. 15"
                      min="1"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows={3} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 resize-none outline-none" 
                    placeholder="Briefly describe the key learning objectives..." 
                  ></textarea>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mt-8 relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-gray-50/50 transition-colors hover:border-[#0D9488] group overflow-hidden min-h-[200px]">
                <input 
                  type="file"
                  accept="video/*"
                  key={uploadKey}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCurrentFile(file);
                      setIsUploadComplete(true);
                    }
                  }}
                />
                {!isUploadComplete && !isPublishing && (
                  <>
                    <UploadCloud className="w-12 h-12 text-[#0D9488] mb-4 group-hover:scale-110 transition-transform" />
                    <p className="mt-4 text-sm font-bold text-gray-900">Drag & drop your file or click to browse</p>
                    <p className="text-xs text-gray-500 mt-2">Supports MP4, MOV, WebM (Stored permanently in Database)</p>
                  </>
                )}
                
                {isPublishing && (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#0D9488] animate-spin mb-4" />
                    <p className="text-sm font-bold text-gray-900 text-center">
                      Uploading and saving to PaceMaker database... <br/>
                      <span className="text-xs font-normal text-gray-500 italic">Do not close this window</span>
                    </p>
                  </div>
                )}

                {isUploadComplete && !isPublishing && (
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                    <p className="mt-4 text-sm font-bold text-green-600">{currentFile?.name} ready!</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end items-center gap-6">
                <button 
                  className="font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => {
                    setTitle('');
                    setTags('');
                    setDuration('15');
                    setDescription('');
                    setIsUploadComplete(false);
                    setCurrentFile(null);
                    regenerateIds();
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing || !isUploadComplete}
                  className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isPublishing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {isPublishing ? 'Storing...' : 'Save & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Uploaded List */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 shadow-sm bg-white">
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Video className="w-5 h-5 text-[#0D9488]" /> Uploaded Videos ({recentVideos.length})
             </h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {recentVideos.length === 0 ? (
                 <div className="text-center p-4 text-sm text-gray-500">
                   No uploaded videos yet.
                 </div>
               ) : (
                 recentVideos.map((video) => (
                   <div 
                     key={video.id} 
                     onClick={() => handlePlayVideo(video)}
                     className="flex gap-3 items-center p-3 rounded-xl transition-colors border border-transparent cursor-pointer hover:bg-gray-50 hover:border-gray-200 group"
                   >
                     <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                       <Video className="w-5 h-5 text-[#0D9488] group-hover:opacity-0 transition-opacity" />
                       <div className="absolute inset-0 bg-[#0D9488]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play className="w-5 h-5 text-[#0D9488] fill-current" />
                       </div>
                     </div>
                     <div className="overflow-hidden flex-1">
                       <p className="text-sm font-bold text-gray-900 truncate">{video.title}</p>
                       <p className="text-xs text-gray-500 font-medium mt-0.5">
                         {video.subject}
                       </p>
                     </div>
                      <button
                        onClick={(e) => handleEditVideo(e, video)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Video"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteVideo(e, video.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 ))
               )}
             </div>
          </div>
        </div>

      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col w-screen h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
          <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => setPlayingVideo(null)}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all text-white flex items-center justify-center hover:scale-105"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="font-bold text-xl text-white drop-shadow-md truncate max-w-2xl">{playingVideo.title}</h3>
            </div>
            <button 
              onClick={() => setPlayingVideo(null)}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all text-white flex items-center justify-center hover:scale-105 pointer-events-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 w-full h-full flex items-center justify-center p-12">
            {playingVideo.videoUrl && !videoError ? (
              <video 
                src={playingVideo.videoUrl} 
                controls 
                autoPlay 
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                onError={() => setVideoError(true)}
              />
            ) : (
              <div className="text-center p-8 max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
                <Film className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                <h4 className="text-white text-xl font-bold mb-3">Video Unavailable</h4>
                <p className="text-gray-400">
                  The stored video data could not be retrieved from the server.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      <AnimatePresence>
      {showEditModal && editingVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Video
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-gray-900 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                  <div className="relative">
                    <button type="button" onClick={() => setEditSubjectOpen(!editSubjectOpen)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all flex items-center justify-between text-gray-900 font-medium outline-none">
                      <span className="truncate">{editForm.subject}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${editSubjectOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {editSubjectOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEditSubjectOpen(false)} />
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-150 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                            {ALL_VIDEO_SUBJECTS.map((s) => (
                              <button key={s.value} type="button" onClick={() => { setEditForm({ ...editForm, subject: s.label }); setEditSubjectOpen(false); }}
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#0D9488]/5 ${editForm.subject === s.label ? 'bg-[#0D9488]/10 text-[#0D9488] font-bold' : 'text-gray-700'}`}>
                                {s.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Access Level</label>
                  <div className="relative">
                    <button type="button" onClick={() => setEditAccessOpen(!editAccessOpen)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all flex items-center justify-between text-gray-900 font-medium outline-none">
                      <span>{editForm.accessLevel}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${editAccessOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {editAccessOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEditAccessOpen(false)} />
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-150 overflow-hidden">
                            {['FREE', 'BASIC', 'MEDIUM', 'HIGH'].map((lvl) => (
                              <button key={lvl} type="button" onClick={() => { setEditForm({ ...editForm, accessLevel: lvl }); setEditAccessOpen(false); }}
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#0D9488]/5 ${editForm.accessLevel === lvl ? 'bg-[#0D9488]/10 text-[#0D9488] font-bold' : 'text-gray-700'}`}>
                                {lvl}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tags</label>
                <input type="text" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-gray-900 font-medium" placeholder="medical, lecture" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-gray-900 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={isSavingEdit}
                className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md">
                {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
