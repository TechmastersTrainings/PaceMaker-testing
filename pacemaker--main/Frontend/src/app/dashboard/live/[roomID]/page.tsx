'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, MicOff, Video, VideoOff, Hand, MessageSquare, Users, Settings, 
  LogOut, Share2, Layout, MoreVertical, Send, Smile, X, Maximize2, 
  Activity, Shield, Circle, Lock, Zap, Crown, BarChart3, Radio,
  MonitorPlay, Palette, ClipboardList, Settings2, Loader2, User,
  Link, Check, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { videoService } from '@/services/videoService';
import { liveClassService } from '@/services/liveClassService';

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  time: string;
  role: 'teacher' | 'student';
};

  const createMockStream = (sessionTitle: string) => {
  if (typeof window === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let frame = 0;
  const intervalId = setInterval(() => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7'];
    const barWidth = canvas.width / colors.length;
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * barWidth, 120, barWidth, 180);
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const scannerX = (frame * 6) % canvas.width;
    ctx.fillRect(scannerX, 0, 60, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('PACEMAKER LIVE CLASSROOM', canvas.width / 2, 55);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(sessionTitle.toUpperCase(), canvas.width / 2, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px monospace';
    const elapsedSeconds = Math.floor(frame / 10);
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    ctx.fillText(`${m}:${s}`, canvas.width / 2, 360);

    const isOdd = Math.floor(frame / 5) % 2 === 0;
    ctx.fillStyle = isOdd ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 50, 410, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('REC', canvas.width / 2 - 35, 416);

    frame++;
  }, 100);

  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(10) : null;

  const combinedStream = new MediaStream();
  if (stream && stream.getVideoTracks()[0]) {
    combinedStream.addTrack(stream.getVideoTracks()[0]);
  }

  (combinedStream as any).stopMock = () => {
    clearInterval(intervalId);
    if (stream) stream.getVideoTracks().forEach((t: any) => t.stop());
  };

  return combinedStream;
};

export default function LiveClassroomPage({ params }: { params: Promise<{ roomID: string }> }) {
  const resolvedParams = use(params);
  const roomID = resolvedParams.roomID;
  
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'notes'>('chat');
  const [sessionTitle, setSessionTitle] = useState('Initializing Classroom...');
  const [instructorName, setInstructorName] = useState('Medical Expert');
  const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
  const [autoRecord, setAutoRecord] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'ready' | 'live'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const router = useRouter();

  const roomUrl = typeof window !== 'undefined' ? window.location.href : '';

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      (streamRef.current as any).stopMock?.();
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    streamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as any;
    setUserRole(role);

    const loadSessionInfo = async () => {
      try {
        const list = await liveClassService.getAllLiveClasses();
        const current = list.find((s: any) => s.zoomMeetingId === roomID);
        if (current) {
          setSessionTitle(current.title);
          setInstructorName(current.trainerName || 'Medical Expert');
          setAutoRecord(current.autoRecord === true);
        }
      } catch (e) {
        console.error("Failed to load session details from backend:", e);
      }
    };
    loadSessionInfo();

    setConnectionState('connecting');
    const timer = setTimeout(() => {
      setConnectionState('ready');
    }, 1500);

    return () => {
      clearTimeout(timer);
      stopAllTracks();
    };
  }, [roomID, stopAllTracks]);

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = roomUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      setIsUsingFallback(false);
      setConnectionState('live');
    } catch (err) {
      console.error("Camera/mic unavailable, using fallback stream:", err);
      setIsUsingFallback(true);
      const mockStream = createMockStream(sessionTitle);
      if (mockStream) {
        streamRef.current = mockStream;
        setLocalStream(mockStream);
        setIsVideoOff(false);
        setIsMuted(false);
        setConnectionState('live');
      } else {
        setConnectionState('live');
      }
    }
  };

  useEffect(() => {
    if (!localStream) return;
    
    if (isRecording) {
      try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') 
          ? 'video/webm;codecs=vp8,opus' 
          : 'video/webm';
          
        const recorder = new MediaRecorder(localStream, { mimeType });
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = async () => {
          setIsSaving(true);
          try {
            const blob = new Blob(chunks, { type: mimeType });
            const file = new File([blob], `live_recording_${Date.now()}.webm`, { type: mimeType });

            const formData = new FormData();
            formData.append('title', `Live Recording: ${sessionTitle}`);
            formData.append('description', `Live session recording for room ${roomID}. Led by ${instructorName}.`);
            formData.append('category', 'MEDICINE');
            formData.append('accessLevel', 'FREE');
            formData.append('file', file);

            await videoService.uploadVideo(formData);
            console.log("Live recording uploaded successfully");
          } catch (err) {
            console.error("Failed to upload recording:", err);
          } finally {
            setIsSaving(false);
          }
        };
        
        recorder.start(1000);
        recordingStartTimeRef.current = Date.now();
        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Error starting recorder", err);
        setIsRecording(false);
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }
  }, [isRecording, localStream, sessionTitle, instructorName]);

  const endSession = async () => {
    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    stopAllTracks();
    if (userRole === 'instructor') {
      router.push('/instructor/live');
    } else {
      router.push('/dashboard/live');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: 'Me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'student'
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col z-[1000] selection:bg-teal-500 selection:text-white">
      
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center"
          >
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-teal-600/20 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Finalizing Recording</h3>
                <p className="text-sm text-gray-400 mt-2">Please wait while we prepare and save your live class recording safely.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <header className="h-16 px-6 flex items-center justify-between bg-black border-b border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <Radio className="w-4 h-4 text-white animate-pulse" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-sm font-bold text-white line-clamp-1">{sessionTitle}</h1>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Live Interactive Room</span>
                   <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">ID: {roomID}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-6 mr-6">
              <StatItem icon={Users} label="Active" value="1,248" />
              <StatItem icon={Activity} label="Stream" value="1080p HD" color="text-emerald-500" />
           </div>

           <button
             onClick={shareLink}
             className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
           >
             {linkCopied ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4" />}
             {linkCopied ? 'Copied!' : 'Share Link'}
           </button>
           
           <button 
             onClick={endSession}
             className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-red-600/20"
           >
             <LogOut className="w-4 h-4" />
             {userRole === 'instructor' ? 'End Session' : 'Leave Session'}
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden bg-[#111111]">
        
        <div className="flex-1 flex flex-col relative bg-black">
           
           <div className="flex-1 relative flex items-center justify-center group">
              <div className="w-full h-full max-w-6xl aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
                  {connectionState !== 'live' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                      {connectionState === 'connecting' ? (
                        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-900 border border-teal-500/30 flex items-center justify-center">
                          <MonitorPlay className="w-10 h-10 text-teal-600" />
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white">{instructorName}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                          {connectionState === 'connecting' ? 'Establishing secure connection...' : 'Classroom ready. Start your session.'}
                        </p>
                        {connectionState === 'ready' && (
                          <>
                            <button 
                              onClick={startStream}
                              className="mt-6 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/20"
                            >
                              Join Session
                            </button>
                            <p className="mt-4 text-xs text-gray-600 flex items-center justify-center gap-1.5">
                              <Link className="w-3 h-3" />
                              Share the link above to let others join
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gray-900">
                      {localStream && !isVideoOff ? (
                        <video 
                          autoPlay muted playsInline 
                          ref={(el) => { if (el) el.srcObject = localStream; }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]">
                          <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                            <User className="w-10 h-10 text-gray-600" />
                          </div>
                          <p className="text-gray-500 font-bold mt-4">Camera is Off</p>
                        </div>
                      )}

                      {/* Waiting for participants banner */}
                      <div className="absolute top-6 left-6 flex items-center gap-2 bg-teal-600/20 backdrop-blur-md px-4 py-2 rounded-lg border border-teal-500/30">
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-black flex items-center justify-center text-[8px] font-bold">Y</div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-300">Waiting for participants...</span>
                      </div>

                      {isUsingFallback && (
                        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 bg-amber-600/20 backdrop-blur-md px-4 py-3 rounded-lg border border-amber-500/30">
                          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-[10px] font-medium text-amber-300 leading-relaxed">
                            Camera & microphone blocked. Click the lock icon in your browser address bar, set permissions to Allow, then reload.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                    {isRecording ? (
                      <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20 text-red-500 font-extrabold animate-pulse">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                        </span>
                        <span className="text-[10px] font-black tracking-widest">REC</span>
                      </div>
                    ) : null}
                  </div>
              </div>

              <div className="absolute bottom-10 left-10 w-56 h-36 bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl group/inset">
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Users className="w-8 h-8" />
                 </div>
                 <div className="absolute top-3 left-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">You</span>
                 </div>
              </div>
           </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#0a0a0a] border border-gray-800 rounded-3xl shadow-2xl flex items-center gap-6 z-50">
              <ControlBtn active={!isMuted} onClick={() => setIsMuted(!isMuted)} icon={isMuted ? MicOff : Mic} label="Audio" />
              <ControlBtn active={!isVideoOff} onClick={() => setIsVideoOff(!isVideoOff)} icon={isVideoOff ? VideoOff : Video} label="Video" />
              <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
              
              {isUsingFallback && (
                <>
                  <ControlBtn active={false} onClick={() => {
                    stopAllTracks();
                    setConnectionState('ready');
                    setIsUsingFallback(false);
                    setTimeout(() => startStream(), 100);
                  }} icon={Shield} label="Retry Camera" color="text-amber-400" />
                  <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
                </>
              )}

               {userRole === 'instructor' && (
                <>
                  <ControlBtn active={isRecording} onClick={() => setIsRecording(!isRecording)} icon={Circle} label="Record" color={isRecording ? "text-red-500" : "text-gray-400"} />
                  <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
                </>
              )}

              <ControlBtn active={isHandRaised} onClick={() => setIsHandRaised(!isHandRaised)} icon={Hand} label="Raise Hand" color={isHandRaised ? "text-amber-500" : "text-gray-400"} />
              <ControlBtn icon={Share2} label="Present" />
              <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-3.5 rounded-xl transition-all ${isChatOpen ? 'bg-teal-600 text-white' : 'bg-gray-900 text-gray-500 hover:text-white'}`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
        </div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.aside 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className="w-[400px] bg-white dark:bg-[#111111] border-l border-gray-800 flex flex-col z-10"
            >
              <div className="flex border-b border-gray-100 dark:border-gray-800 p-2 gap-1 bg-gray-50 dark:bg-black/20">
                {(['chat', 'participants', 'notes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-[#111111]">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                         <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'teacher' ? 'items-start' : 'items-end'}`}>
                           <div className="flex items-center gap-2 mb-1.5 px-1">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'teacher' ? 'text-teal-600' : 'text-gray-400'}`}>{msg.user}</span>
                              <span className="text-[8px] text-gray-300">{msg.time}</span>
                           </div>
                           <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm ${msg.role === 'teacher' ? 'bg-teal-600 text-white rounded-tl-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'}`}>
                              {msg.text}
                           </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSendMessage} className="relative">
                      <input 
                        type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-6 pr-14 py-4 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all active:scale-90 shadow-md">
                         <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              )}

              {activeTab === 'participants' && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="opacity-30">
                    <Users className="w-12 h-12 mb-4 mx-auto" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Participants</h3>
                  </div>
                  <div className="mt-8 w-full space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-teal-600/10 rounded-xl border border-teal-500/20">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold">Y</div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{instructorName}</p>
                        <p className="text-[9px] text-teal-400 uppercase tracking-widest font-bold">Host</p>
                      </div>
                      <span className="ml-auto w-2 h-2 rounded-full bg-teal-500"></span>
                    </div>
                    <p className="text-xs text-gray-600 pt-4 flex items-center justify-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Waiting for others to join...
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                   <ClipboardList className="w-12 h-12 mb-4 mx-auto" />
                   <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Notes</h3>
                   <p className="text-xs mt-2 font-medium">Coming soon to the medical ecosystem.</p>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

function StatItem({ icon: Icon, label, value, color = "text-gray-400" }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className="p-2 bg-white/5 rounded-lg"><Icon className={`w-3.5 h-3.5 ${color}`} /></div>
       <div className="flex flex-col">
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-[11px] font-bold text-white mt-0.5">{value}</p>
       </div>
    </div>
  );
}

function ControlBtn({ icon: Icon, label, active = false, onClick, color = "text-gray-400" }: any) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <button 
        onClick={onClick}
        className={`p-3.5 rounded-xl transition-all duration-200 ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-gray-900 text-gray-500 hover:bg-gray-800 hover:text-white'}`}
      >
        <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : color}`} />
      </button>
      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-gray-300 transition-colors">{label}</span>
    </div>
  );
}
