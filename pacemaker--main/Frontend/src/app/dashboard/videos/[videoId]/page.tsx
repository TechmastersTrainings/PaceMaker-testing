'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, Pause, Volume2, Maximize, ChevronLeft, 
  MessageSquare, Heart, Reply, MoreVertical, 
  Pin, CheckCircle2, Trash2, Send, 
  Smile, Clock, User, Share2, Edit3, X, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { videoService } from '@/services/videoService';
import { commentService } from '@/services/commentService';
import { API_HOST } from '@/lib/apiClient';
import type { Comment, Reply as ReplyType } from '@/lib/commentStore';

import { VideoPlayerSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function VideoDetailPagePage() {
  return (
    <ErrorBoundary>
      <VideoDetailPage />
    </ErrorBoundary>
  );
}

function VideoDetailPage() {
  const { videoId } = useParams();
  const router = useRouter();
  const { canAccess, loading: subLoading } = useSubscription();
  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('student_1');
  const [currentUserName, setCurrentUserName] = useState<string>('Student');
  const [isLoading, setIsLoading] = useState(true);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'liked'>('newest');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchComments = async () => {
    try {
      const rawComments = await commentService.getCommentsByVideo(Number(videoId));
      const commentMap = new Map<number, Comment>();
      const rootComments: Comment[] = [];

      rawComments.forEach((rc: any) => {
        commentMap.set(rc.id, {
          id: String(rc.id),
          videoId: String(rc.videoId),
          userId: String(rc.userId),
          userName: rc.userId === 1 ? 'Instructor' : `Student #${rc.userId}`,
          text: rc.commentText || '',
          likes: [],
          replies: [],
          isPinned: false,
          isAnswered: false,
          isInstructor: rc.userId === 1,
          isVerified: rc.userId === 1,
          isReported: false,
          reportCount: 0,
          status: 'approved',
          createdAt: rc.createdAt || new Date().toISOString()
        });
      });

      rawComments.forEach((rc: any) => {
        const mapped = commentMap.get(rc.id);
        if (mapped) {
          if (rc.parentCommentId) {
            const parent = commentMap.get(rc.parentCommentId);
            if (parent) {
              parent.replies.push({
                id: mapped.id,
                userId: mapped.userId,
                userName: mapped.userName,
                text: mapped.text,
                likes: [],
                isInstructor: mapped.isInstructor,
                isVerified: mapped.isVerified,
                createdAt: mapped.createdAt
              });
            } else {
              rootComments.push(mapped);
            }
          } else {
            rootComments.push(mapped);
          }
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    if (subLoading) return;

    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('currentUser');
    const isAdminOrInstructor = role === 'admin' || role === 'instructor' || role === 'superadmin' || role === 'trainer';
    
    if (!isAdminOrInstructor && !canAccess('videos')) {
      router.push('/dashboard/videos');
      return;
    }

    setUserRole(role);
    setCurrentUserName(name || 'Student');
    
    const loadVideo = async () => {
      try {
        const vid = await videoService.getVideoById(Number(videoId));
        setVideo(vid);
        
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const apiHost = process.env.NEXT_PUBLIC_API_URL || (isLocal ? 'http://localhost:8080' : '');
        const fullUrl = vid.videoUrl.startsWith('http') ? vid.videoUrl : `${apiHost}${vid.videoUrl}`;
        setVideoUrl(fullUrl);
        const allVids = await videoService.getAllVideos();
        const filtered = allVids.filter((v: any) => String(v.id) !== videoId);
        setRelatedVideos(filtered.slice(0, 5));

        const resume = await videoService.getResume(Number(videoId));
        if (resume.completed) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Failed to load video:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideo();
    fetchComments();
  }, [subLoading, videoId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    const pct = (videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1) * 100;
    setProgress(pct);
  };

  const handleVideoEnded = () => {
    setProgress(100);
    if (!isCompleted) {
      setShowConfirmComplete(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
    setProgress(pct * 100);
  };

  // Send watch progress to backend every 10 seconds while playing
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;
    const interval = setInterval(async () => {
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      if (currentTime > 0) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${API_HOST}/api/videos/watch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify({ videoId: Number(videoId), watchedDuration: currentTime }),
          });
        } catch {}
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, videoId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentService.createComment({
        videoId: Number(videoId),
        text: newComment,
      });
      await fetchComments();
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    try {
      await commentService.createComment({
        videoId: Number(videoId),
        text: replyText,
        parentId: Number(commentId)
      });
      await fetchComments();
      setReplyTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const handleLikeComment = (commentId: string) => {
    // Backend doesn't support likes natively yet, let's keep it as local toggle
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const liked = c.likes.includes(currentUserId);
        return {
          ...c,
          likes: liked ? c.likes.filter(id => id !== currentUserId) : [...c.likes, currentUserId]
        };
      }
      return c;
    });
    setComments(updated);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Delete this comment?')) {
      try {
        await commentService.deleteComment(Number(commentId));
        await fetchComments();
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    }
  };

  const handlePinComment = (commentId: string) => {
    const updated = comments.map(c => ({
      ...c,
      isPinned: c.id === commentId ? !c.isPinned : false // Only one pinned comment
    }));
    setComments(updated);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'liked') return b.likes.length - a.likes.length;
    return 0;
  });

  if (isLoading || !video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <VideoPlayerSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-all"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Video and Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player */}
          <div ref={containerRef} className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl group">
            {videoUrl ? (
              <video 
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onClick={togglePlay}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Play className="w-20 h-20 mb-4 opacity-20" />
                <p>Video processing or unavailable</p>
              </div>
            )}
            
            {/* Custom Controls */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-4 overflow-hidden cursor-pointer group/seek" onClick={handleSeek}>
                <div className="bg-primary-500 h-full relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-6">
                  <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <Volume2 className="w-6 h-6" />
                  <span className="text-sm font-bold">
                    {Math.floor(videoRef.current?.currentTime || 0)}:{(videoRef.current?.currentTime || 0).toFixed(0).padStart(2, '0')} 
                    / {Math.floor(videoRef.current?.duration || 0)}:{(videoRef.current?.duration || 0).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
                <Maximize onClick={toggleFullscreen} className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Video Meta */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-5 sm:p-10 shadow-sm">
            <div className="flex justify-between items-start gap-4 mb-6">
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{video.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) {
                      navigator.share({ title: video?.title || 'Video', url });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="p-3 rounded-2xl bg-gray-50 hover:bg-primary-50 hover:text-primary-600 transition-all text-gray-400"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {userRole === 'instructor' && (
                  <button 
                    onClick={async () => {
                      if (confirm('Delete this video?')) {
                        try {
                          await videoService.deleteVideo(Number(video.id));
                          router.push('/instructor/videos');
                        } catch (err) {
                          console.error("Failed to delete video:", err);
                          alert("Failed to delete video from database.");
                        }
                      }
                    }}
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 mb-8 text-gray-500 font-bold text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                <span>Dr. {video.instructor || 'Instructor'}</span>
                <CheckCircle2 className="w-3 h-3 text-primary-500 fill-current" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{isNaN(Number(video.id)) || Number(video.id) < 100000000000 ? new Date().toLocaleDateString() : new Date(Number(video.id)).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed font-medium">
              {video.description || 'No description available for this video module.'}
            </p>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Mark this video as complete when you finish watching.</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      {progress < 90 ? `Watched ${Math.round(progress)}% — need 90% to enable` : 'You can now mark this video as complete!'}
                    </p>
                  </div>
                )}
              </div>
              {!isCompleted && (
                <button
                  onClick={() => setShowConfirmComplete(true)}
                  disabled={completing || progress < 90}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                    progress >= 90
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {completing ? 'Marking...' : progress >= 90 ? 'Mark as Complete' : 'Not yet available'}
                </button>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {showConfirmComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Mark as Complete?</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    Confirm that you have finished watching this video. Your progress ({Math.round(progress)}%) will be saved and reflected in your course progress.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmComplete(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setCompleting(true);
                        try {
                          await videoService.markComplete(Number(videoId));
                          setIsCompleted(true);
                          setShowConfirmComplete(false);
                        } catch (err) {
                          console.error('Failed to mark complete:', err);
                        } finally {
                          setCompleting(false);
                        }
                      }}
                      disabled={completing}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {completing ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comment Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              Comments ({comments.length})
            </h2>
            <select 
              value={sortBy}
              onChange={(e:any) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="liked">Most Liked</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Post Comment */}
          <form onSubmit={handlePostComment} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-12">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black shrink-0">
                {currentUserName[0]}
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or share your thoughts..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 min-h-[100px] outline-none"
                />
                <div className="flex justify-between items-center">
                  <button type="button" className="text-gray-400 hover:text-primary-600 transition-colors">
                    <Smile className="w-6 h-6" />
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20"
                  >
                    Post Comment <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-8">
            <AnimatePresence>
              {sortedComments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-8 rounded-[2.5rem] border ${comment.isPinned ? 'bg-primary-50/30 border-primary-100' : 'bg-white border-gray-100'} shadow-sm`}
                >
                  <div className="flex gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${comment.isInstructor ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                      {comment.userName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">{comment.userName}</span>
                          {comment.isInstructor && (
                            <span className="px-2 py-0.5 bg-primary-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-2 h-2" /> Instructor
                            </span>
                          )}
                          {comment.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary-600">
                              <Pin className="w-3 h-3" /> Pinned
                            </span>
                          )}
                        </div>
                        <div className="relative group">
                          <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden hidden group-hover:block z-20">
                            {userRole === 'instructor' && (
                              <>
                                <button onClick={() => handlePinComment(comment.id)} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <Pin className="w-4 h-4" /> {comment.isPinned ? 'Unpin' : 'Pin Comment'}
                                </button>
                                <button onClick={() => handleDeleteComment(comment.id)} className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </>
                            )}
                            {currentUserId === comment.userId && (
                              <button className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <p className="mt-4 text-gray-700 font-medium leading-relaxed">{comment.text}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-6 mt-6">
                        <button 
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-2 text-sm font-bold transition-colors ${comment.likes.includes(currentUserId) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        >
                          <Heart className={`w-4 h-4 ${comment.likes.includes(currentUserId) ? 'fill-current' : ''}`} />
                          {comment.likes.length}
                        </button>
                        <button 
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          Reply
                        </button>
                      </div>

                      {/* Reply Form */}
                      <AnimatePresence>
                        {replyTo === comment.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 overflow-hidden"
                          >
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black shrink-0 text-xs">
                                {currentUserName[0]}
                              </div>
                              <div className="flex-1 space-y-2">
                                <textarea 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-900 font-medium outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setReplyTo(null)} className="px-4 py-1.5 text-xs font-bold text-gray-500">Cancel</button>
                                  <button 
                                    onClick={() => handlePostReply(comment.id)}
                                    className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-primary-500/20"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Replies List */}
                      {comment.replies.length > 0 && (
                        <div className="mt-8 space-y-6 border-l-2 border-gray-50 ml-1 pl-3 sm:pl-8">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="relative">
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${reply.isInstructor ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                                  {reply.userName[0]}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-gray-900">{reply.userName}</span>
                                    {reply.isInstructor && (
                                      <span className="px-1.5 py-0.5 bg-primary-600 text-white text-[6px] font-black uppercase tracking-widest rounded-sm">
                                        Instructor
                                      </span>
                                    )}
                                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{reply.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Recommendations / Playlist */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-5 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary-500" />
              Related Content
            </h3>
            <div className="space-y-6">
              {relatedVideos.length > 0 ? relatedVideos.map((rv: any) => (
                <div
                  key={rv.id}
                  onClick={() => router.push(`/dashboard/videos/${rv.id}`)}
                  className="flex gap-4 group cursor-pointer"
                >
                  <div className="w-32 aspect-video bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                    <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-primary-600 fill-current" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{rv.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">{rv.instructor?.toUpperCase() || 'INSTRUCTOR'} • {rv.duration ? `${Math.floor(rv.duration / 60)}m` : '45m'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 font-medium">No related content yet.</p>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Study Groups</h3>
              <p className="text-white/80 text-sm font-medium mb-6">Join 2,400+ students in our specialized cardiology group.</p>
              <button className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                Join Community
              </button>
            </div>
            <MessageSquare className="absolute -bottom-8 -right-8 w-40 h-40 text-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
