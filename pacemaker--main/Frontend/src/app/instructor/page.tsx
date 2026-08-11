'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Radio, BookOpen, FileText, BarChart3, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { videoService, VideoResponse } from '@/services/videoService';
import { liveClassService, LiveClassResponse } from '@/services/liveClassService';
import { studyMaterialService } from '@/services/studyMaterialService';
import { useAuth } from '@/contexts/AuthContext';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassResponse[]>([]);
  const [courseCount, setCourseCount] = useState(0);
  const [studyMaterials, setStudyMaterials] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dbVideos, dbLiveClasses, dbMaterials] = await Promise.all([
          videoService.getAllVideos(),
          liveClassService.getAllLiveClasses(),
          studyMaterialService.getAllMaterials(),
        ]);
        const currentUser = localStorage.getItem('currentUser') || '';
        const name = currentUser;

        const myVideos = dbVideos.filter((v) =>
          v.instructor?.toLowerCase() === name.toLowerCase()
        );
        setVideos(myVideos);

        const uniqueCourses = new Set(myVideos.map(v => v.subject || v.category).filter(Boolean));
        setCourseCount(uniqueCourses.size);

        const myClasses = dbLiveClasses.filter((lc) =>
          lc.trainerName?.toLowerCase() === name.toLowerCase()
        );
        setLiveClasses(myClasses);

        setStudyMaterials(dbMaterials.length);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'IN';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#106EBE]/30 border-t-[#106EBE] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const upcomingClasses = liveClasses
    .filter((lc) => new Date(lc.classDateTime) > new Date())
    .sort((a, b) => new Date(a.classDateTime).getTime() - new Date(b.classDateTime).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#106EBE] to-[#0FFCBE] flex items-center justify-center text-white font-black text-sm shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Welcome, {user?.name || 'Instructor'}
              </h1>
              <p className="text-sm text-gray-500">Manage your content and track your impact.</p>
            </div>
          </div>
          </div>
        </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#106EBE]" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Video, label: 'Upload Video', href: '/instructor/videos', desc: 'Add new lecture content' },
            { icon: Radio, label: 'Schedule Live', href: '/admin/live', desc: 'Plan a live session' },
            { icon: FileText, label: 'Study Material', href: '/admin/study-material', desc: 'Upload notes & PDFs' },
            { icon: GraduationCap, label: 'Leaderboard', href: '/instructor/leaderboard', desc: 'View student rankings' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#106EBE]/30 hover:bg-[#106EBE]/5 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#106EBE]/5 flex items-center justify-center group-hover:bg-[#106EBE]/10 transition-colors">
                <action.icon className="w-5 h-5 text-[#106EBE]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{action.label}</p>
                <p className="text-[10px] text-gray-400 font-medium">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Video, label: 'My Videos', value: videos.length.toString() },
          { icon: Radio, label: 'Live Classes', value: liveClasses.length.toString() },
          { icon: BookOpen, label: 'Courses', value: courseCount.toString() },
          { icon: FileText, label: 'Study Materials', value: studyMaterials.toString() },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-4 shadow-lg flex flex-col items-center justify-center text-center hover:scale-[1.03] hover:shadow-xl transition-all duration-200 cursor-default"
          >
            <p className="text-[11px] font-bold text-white/90 mb-1.5">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}

        {/* Upcoming Classes Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-4 shadow-lg flex flex-col hover:scale-[1.03] hover:shadow-xl transition-all duration-200"
        >
          <p className="text-[11px] font-bold text-white/90 mb-1.5">Upcoming Classes</p>
          {upcomingClasses.length > 0 ? (
            (() => {
              const lc = upcomingClasses[0];
              return (
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-black text-white leading-tight truncate">{lc.title}</p>
                  <p className="text-[10px] text-white/80 font-black">
                    {new Date(lc.classDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {lc.topic && (
                    <p className="text-[10px] text-white/70 font-black truncate">{lc.topic}</p>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-[10px] text-white/70 font-black">No classes scheduled</p>
          )}
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-[#106EBE]" /> My Recent Videos
          </h2>
          <Link
            href="/instructor/videos"
            className="text-sm font-bold text-[#106EBE] hover:text-[#0E5DA8] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {videos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-400">No videos yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first video to get started.</p>
            <Link
              href="/instructor/videos"
              className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#106EBE] hover:text-[#0E5DA8] transition-colors"
            >
              <Plus className="w-4 h-4" /> Upload Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-[#106EBE]/60 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#106EBE]/10 to-[#0FFCBE]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Video className="w-5 h-5 text-[#106EBE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{video.title}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    <span className="uppercase tracking-wider">{video.category}</span>
                    {video.duration ? <span className="mx-1.5 text-gray-300">|</span> : ''}
                    {video.duration ? `${Math.round(video.duration / 60)} min` : ''}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                  video.accessLevel === 'FREE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {video.accessLevel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
