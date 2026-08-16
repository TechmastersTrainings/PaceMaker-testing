'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, BookOpen, Users, Award, PlayCircle, ArrowRight, Sparkles, 
  CheckCircle2, Send, Brain, TrendingUp, Target, FileText, Check, 
  HelpCircle, ChevronDown, Mail, ShieldCheck, Zap, BookMarked, 
  Stethoscope, Layers, Lightbulb, Clock, Star
} from 'lucide-react';
import { courseService, Course } from '@/services/courseService';
import apiClient from '@/lib/apiClient';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as any } }
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vignette' | 'rationale'>('vignette');

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);

  useEffect(() => {
    courseService.getAllCourses()
      .then(data => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsSubmitting(true);
    try {
      await apiClient.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsSuccess(false), 5500);
    } catch (err) {
      console.error('Newsletter failed:', err);
    } finally {
      setNewsSubmitting(false);
    }
  };

  const coreServices = [
    {
      title: 'Live Masterclasses',
      desc: 'Interactive live coaching sessions & clinical case walkthroughs led by top medical consultants.',
      icon: <Activity className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Real-Time'
    },
    {
      title: 'Intelligent Q-Bank',
      desc: '15,000+ high-yield clinical MCQs featuring instant AI-driven distractor rationale & PYQ filters.',
      icon: <BookOpen className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'AI Powered'
    },
    {
      title: 'Simulated Grand Tests',
      desc: 'Realistic NEET PG & INICET exam engine with predictive national ranking and detailed score analytics.',
      icon: <Target className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'National Rank'
    },
    {
      title: '24/7 AI Medical Tutor',
      desc: 'Groq LLaMA-powered medical RAG assistant for instant diagnostic explanations & clinical PDF downloads.',
      icon: <Brain className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'RAG 2.0 Engine'
    },
    {
      title: 'High-Yield Revision',
      desc: 'Curated clinical flowcharts, radiology image banks, histology slides, and concise subject notes.',
      icon: <FileText className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'High Yield'
    },
    {
      title: 'Performance Analytics',
      desc: 'Deep subject-wise mastery tracking, accuracy trends, and personalized study recommendations.',
      icon: <TrendingUp className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Smart Metrics'
    },
  ];

  const stats = [
    { label: 'Medical Aspirants', value: '50,000+' },
    { label: 'Clinical Vignettes', value: '15,000+' },
    { label: 'NEET PG Pass Rate', value: '98.4%' },
    { label: 'AI Response Latency', value: '< 200ms' },
  ];

  const testimonials = [
    {
      name: 'Dr. Ananya Sharma',
      role: 'AIR 42 • NEET PG Top Ranker',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop',
      text: 'PaceMaker’s case-based Q-Bank and instant AI explanations turned complex pathology and pharmacology concepts into second nature during my final prep.'
    },
    {
      name: 'Dr. Rohan Mehta',
      role: 'INICET Ranker • AIIMS New Delhi',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop',
      text: 'The simulated grand tests accurately reflected the exam pattern. The diagnostic rationale breakdown saved me hundreds of hours of manual textbook searches.'
    },
    {
      name: 'Dr. Kavita Verma',
      role: 'Final Year MBBS Student',
      image: 'https://images.unsplash.com/photo-1594824813571-2b533411efa0?q=80&w=300&auto=format&fit=crop',
      text: 'The live masterclasses paired with clinical flowcharts made revision during rotations effortless. I recommend PaceMaker to every medical student!'
    }
  ];

  const faqs = [
    { 
      q: "What is PaceMaker Academy?", 
      a: "PaceMaker is an elite Learning Management System (LMS) engineered exclusively for MBBS students, interns, and PG aspirants (NEET PG / INICET). It unifies clinical video lectures, high-yield Q-Banks, grand test series, and an AI Medical Tutor." 
    },
    { 
      q: "How does the AI Medical Tutor & RAG Engine work?", 
      a: "Our AI Tutor utilizes Retrieval-Augmented Generation (RAG) trained on standard medical textbooks. It provides instant clinical explanations, differential diagnostic breakdowns, and downloadable study reports." 
    },
    { 
      q: "Can I access PaceMaker on mobile devices?", 
      a: "Yes! PaceMaker supports full cross-platform access via mobile and desktop, enabling offline Q-Bank bookmarking, video streaming, and real-time performance sync." 
    },
    {
      q: "How are the subscriptions structured?",
      a: "Subscriptions are categorized by academic level (1st-4th Year MBBS, Internship, PG Entrance) with tailored pricing plans (Plan A - Test Series, Plan B - QBank + Tests, Plan C - Full Learning Suite)."
    }
  ];

  return (
    <div className="flex-1 flex flex-col w-full relative bg-[#F8FAFC]">
      {/* Background Decorative Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#106EBE]/15 blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-gradient-to-b from-[#0B2545] via-[#106EBE] to-[#0A4E8A] border-b border-white/10 relative overflow-hidden shadow-2xl py-12 md:py-20 text-white"
      >
        {/* Subtle Overlay Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0FFCBE]/15 border border-[#0FFCBE]/30 text-[#0FFCBE] mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#0FFCBE] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Medical LMS Platform 2.0 • NEET PG & INICET Ready</span>
              </div>

              <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-black text-white leading-[1.08] tracking-tight mb-5 font-display">
                Unleash the Physician <br className="hidden sm:inline" />
                in You with <span className="text-[#0FFCBE] underline decoration-[#0FFCBE]/40 decoration-wavy decoration-2">PaceMaker</span>
              </h1>

              <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed max-w-xl font-normal">
                Master high-yield clinical lectures, solve case-based Q-Banks with AI distractor rationale, and excel in competitive medical entrance exams.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
                <Link 
                  href="/register" 
                  className="bg-[#0FFCBE] hover:bg-white text-[#0B2545] font-black px-7 py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#0FFCBE]/25 flex items-center justify-center gap-2.5 compact-btn group"
                >
                  Join Academy 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#services" 
                  className="border border-white/30 hover:bg-white/15 text-white font-bold px-7 py-3.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 compact-btn transition-all backdrop-blur-sm"
                >
                  <PlayCircle className="w-4 h-4 text-[#0FFCBE]" /> Explore Features
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-white/10 w-full text-xs font-semibold text-white/80">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0FFCBE]" /> Accredited Medical Content
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0FFCBE]" /> AI Clinical Vignettes
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#0FFCBE] fill-[#0FFCBE]" /> 4.9/5 Student Rating
                </span>
              </div>
            </div>

            {/* Right Hero Interactive Preview Card */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0FFCBE]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0FFCBE] flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> AI Medical RAG Simulator
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#0FFCBE]/20 text-[#0FFCBE] px-2.5 py-1 rounded-full border border-[#0FFCBE]/30">
                    Live Demo
                  </span>
                </div>

                {/* Case Vignette Snapshot */}
                <div className="bg-[#0B2545]/60 rounded-2xl p-4 border border-white/10 mb-4 text-xs">
                  <div className="flex justify-between items-center text-white/60 text-[11px] mb-2">
                    <span className="font-bold uppercase tracking-wider text-[#0FFCBE]">Clinical Scenario #402</span>
                    <span>Cardiology • High Yield</span>
                  </div>
                  <p className="text-white/90 leading-relaxed font-medium">
                    A 62-year-old male presents with acute substernal chest pain radiating to the left jaw. ECG reveals ST-segment elevation in V1-V4.
                  </p>
                </div>

                {/* Interactive Tabs */}
                <div className="flex rounded-xl bg-black/20 p-1 mb-4 text-xs font-bold">
                  <button 
                    onClick={() => setActiveTab('vignette')}
                    className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'vignette' ? 'bg-[#0FFCBE] text-[#0B2545] shadow-md' : 'text-white/70 hover:text-white'}`}
                  >
                    Differential Diagnosis
                  </button>
                  <button 
                    onClick={() => setActiveTab('rationale')}
                    className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'rationale' ? 'bg-[#0FFCBE] text-[#0B2545] shadow-md' : 'text-white/70 hover:text-white'}`}
                  >
                    High-Yield Pearl
                  </button>
                </div>

                {/* Tab Output Content */}
                <div className="bg-[#0B2545]/90 rounded-2xl p-4 border border-white/10 text-xs">
                  {activeTab === 'vignette' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[#0FFCBE] font-bold">
                        <span>1. Acute Anterior STEMI</span>
                        <span className="text-[10px] bg-[#0FFCBE]/20 px-2 py-0.5 rounded">Primary (96%)</span>
                      </div>
                      <p className="text-white/80 leading-normal text-[11px]">
                        LAD occlusion affecting the anterior wall of the left ventricle. Immediate PCI indicated.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[#0FFCBE] font-bold">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300" /> Exam Pearl
                      </div>
                      <p className="text-white/80 leading-normal text-[11px]">
                        Door-to-balloon time benchmark: &lt; 90 minutes. Always co-prescribe Dual Antiplatelet Therapy (DAPT).
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70 font-medium">
                  <span>PaceMaker Diagnostic RAG 2.0</span>
                  <Link href="/register" className="text-[#0FFCBE] font-bold hover:underline flex items-center gap-1">
                    Try AI Tutor <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Metric Statistics Bar */}
      <section className="w-full bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-2xl sm:text-4xl font-black text-[#106EBE] font-display tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services / Core Ecosystem Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        id="services"
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-[#F8FAFC] relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
              <Layers className="w-3.5 h-3.5" /> Comprehensive Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight font-display">
              Architected for Clinical Excellence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 font-normal">
              Every tool in PaceMaker is tailored specifically for the rigorous demands of medical education.
            </p>
          </div>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {coreServices.map((service, idx) => (
              <motion.div variants={cardVariants} key={idx}>
                <Link
                  href={service.href}
                  className="group p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:border-[#106EBE]/40 transition-all flex flex-col justify-between h-full compact-card relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#106EBE]/5 rounded-bl-full group-hover:scale-110 transition-transform pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#106EBE]/10 flex items-center justify-center group-hover:bg-[#106EBE] group-hover:text-white transition-colors duration-300">
                        {service.icon}
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest bg-[#0FFCBE]/20 text-[#0B2545] px-3 py-1 rounded-md border border-[#0FFCBE]/50">
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#0B2545] mb-2.5 font-display tracking-tight group-hover:text-[#106EBE] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed mb-6">
                      {service.desc}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#106EBE] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all pt-3 border-t border-slate-100">
                    Launch Portal <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Courses Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        id="courses"
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
                <BookOpen className="w-3.5 h-3.5" /> High-Yield Modules
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight font-display">
                Professional Courses
              </h2>
            </div>
            <Link 
              href="/pricing" 
              className="text-xs font-bold text-[#106EBE] uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all shrink-0 bg-[#106EBE]/10 px-4 py-2.5 rounded-xl border border-[#106EBE]/20"
            >
              View Pricing Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-pulse">
                  <div className="aspect-video bg-slate-200 rounded-xl mb-4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-slate-500 font-medium bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300">
                <BookMarked className="w-10 h-10 mx-auto mb-3 text-[#106EBE] opacity-50" />
                <p className="text-base font-bold text-[#0B2545]">Curriculum Update in Progress</p>
                <p className="text-xs text-slate-500 mt-1">Instructor modules are currently being synchronized.</p>
              </div>
            ) : (
              courses.map((course) => (
                <motion.div variants={cardVariants} key={course.id}>
                  <Link
                    href="/pricing"
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl hover:border-[#106EBE]/40 transition-all block compact-card group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#0B2545] to-[#106EBE] rounded-xl mb-4 overflow-hidden relative">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.courseName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80 uppercase tracking-widest p-3 text-center">
                          {course.subject}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#0B2545]/75 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-[#0FFCBE] text-[#0B2545] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg">
                          Unlock Course
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold text-[#106EBE] uppercase tracking-widest bg-[#106EBE]/10 px-2.5 py-1 rounded-md mb-2 inline-block border border-[#106EBE]/20">
                      {course.level || 'High Yield'}
                    </span>
                    <h4 className="font-bold text-[#0B2545] text-base mb-1 font-display tracking-tight leading-snug truncate group-hover:text-[#106EBE] transition-colors">
                      {course.courseName}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {course.description || `Comprehensive ${course.subject} module for medical exams.`}
                    </p>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* RAG Engine & Pedagogy Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-[#F8FAFC]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Box */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-[#0B2545] to-[#106EBE] p-8 rounded-3xl border-4 border-white shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0FFCBE]/20 blur-3xl rounded-full pointer-events-none" />
                
                <h4 className="text-white font-black text-2xl mb-6 flex items-center gap-3 font-display">
                  <Award className="w-6 h-6 text-[#0FFCBE]" /> High-Yield Engine
                </h4>
                
                <ul className="space-y-4">
                  {[
                    'Spaced repetition algorithms to filter redundant topics',
                    '2,000+ interactive case vignettes with image triggers',
                    'Real-time national percentile & weakness tracking',
                    'Instant downloadable clinical PDF study notes'
                  ].map((text, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-white/90 items-start">
                      <CheckCircle2 className="w-5 h-5 text-[#0FFCBE] shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between text-xs">
                  <span className="text-white/70">Engineered for MBBS & PG Prep</span>
                  <span className="text-[#0FFCBE] font-bold">RAG 2.0 Enabled</span>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
                <Stethoscope className="w-3.5 h-3.5" /> Clinical Pedagogy
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight leading-[1.1] mb-5 font-display">
                Mirror Real-World Medical Decisions
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
                We bridge the gap between theoretical knowledge and bed-side diagnostic accuracy. Develop the clinical reflexes required to top competitive exams and treat patients with confidence.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#0B2545]">
                  <Check className="w-4 h-4 text-[#106EBE]" /> Active Recall & Case-Based Diagnostic Drills
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#0B2545]">
                  <Check className="w-4 h-4 text-[#106EBE]" /> Standardized Subject Benchmarks & Analytics
                </div>
              </div>

              <Link 
                href="/register" 
                className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-[#106EBE] hover:bg-[#0B2545] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-md"
              >
                Explore Full Curriculum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Testimonials / Medical Rankers Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
              <Star className="w-3.5 h-3.5 fill-[#106EBE]" /> Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight font-display">
              Trusted by Medical Top Rankers
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Discover how PaceMaker transformed preparation for students across the country.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal italic mb-6">
                    &quot;{t.text}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/80">
                  <div className="w-10 h-10 rounded-full bg-slate-300 relative overflow-hidden shrink-0">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0B2545] text-sm font-display">{t.name}</h5>
                    <p className="text-[11px] text-[#106EBE] font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gradient-to-r from-[#0B2545] via-[#106EBE] to-[#0A4E8A] text-white relative overflow-hidden"
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Mail className="w-6 h-6 text-[#0FFCBE]" />
          </div>
          <h2 className="text-xs font-bold text-[#0FFCBE] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FFCBE]" /> Weekly Medical Briefing
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display mb-3">
            High-Yield Clinical Updates
          </h3>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-md mx-auto mb-8 font-normal">
            Get weekly case discussions, high-frequency exam topics, and mock breakdowns delivered directly to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto relative">
            <div className="relative flex items-center shadow-xl rounded-2xl bg-white p-1.5">
              <input
                type="email"
                required
                placeholder="doctor@institution.edu"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-3 text-sm text-[#0B2545] placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={newsSubmitting || newsSuccess}
                className="px-6 py-3 bg-[#0FFCBE] hover:bg-white text-[#0B2545] rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-50 shrink-0"
              >
                {newsSubmitting ? (
                  <span className="w-4 h-4 border-2 border-[#0B2545]/30 border-t-[#0B2545] rounded-full animate-spin" />
                ) : newsSuccess ? (
                  <>Subscribed <CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  <>Subscribe <Send className="w-4 h-4" /></>
                )}
              </button>
            </div>
            {newsSuccess && (
              <p className="text-xs text-[#0FFCBE] font-bold uppercase tracking-widest mt-3 animate-pulse">
                Check your inbox to confirm your subscription!
              </p>
            )}
            <p className="text-[11px] font-medium text-white/60 mt-3">
              No spam. Unsubscribe at any time with a single click.
            </p>
          </form>
        </div>
      </motion.section>

      {/* FAQ Accordion Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white"
      >
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight font-display">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#106EBE] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="text-base font-bold font-display tracking-tight text-[#0B2545]">
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-[#106EBE] text-[#0FFCBE]' : 'bg-slate-100 text-[#0B2545]'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1 font-normal">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
}