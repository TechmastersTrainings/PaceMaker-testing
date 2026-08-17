'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, BookOpen, Users, Award, PlayCircle, ArrowRight, Sparkles, 
  CheckCircle2, Send, TrendingUp, Target, FileText, Check, 
  HelpCircle, ChevronDown, Mail, ShieldCheck, Zap, BookMarked, 
  Stethoscope, Layers, Lightbulb, Clock, Video, BarChart3, MessageSquare
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
      console.error('Newsletter submission:', err);
    } finally {
      setNewsSubmitting(false);
    }
  };

  const coreServices = [
    {
      title: 'Live Ecosystem',
      desc: 'Interactive live classes and clinical case discussions led by medical faculty.',
      icon: <Video className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Live Classes'
    },
    {
      title: 'Clinical Question Bank',
      desc: 'Case-based question bank with distractor rationale and previous year question filters.',
      icon: <BookOpen className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Case Practice'
    },
    {
      title: 'Simulated Grand Tests',
      desc: 'Full-length simulated exam engine modeled for NEET PG and INICET prep.',
      icon: <Target className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Simulations'
    },
    {
      title: 'Clinical Discussion Hub',
      desc: 'Peer and consultant case discussions for diagnostic reasoning and case breakdowns.',
      icon: <MessageSquare className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Case Hub'
    },
    {
      title: 'High-Yield Notes',
      desc: 'Curated clinical flowcharts, image banks, histology slides, and concise notes.',
      icon: <FileText className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Study Material'
    },
    {
      title: 'Performance Analytics',
      desc: 'Track accuracy trends, subject-wise progress, and targeted weakness areas.',
      icon: <BarChart3 className="w-6 h-6 text-[#106EBE]" />,
      href: '/register',
      badge: 'Analytics'
    },
  ];

  const faqs = [
    { 
      q: "What is PaceMaker Academy?", 
      a: "PaceMaker is a Learning Management System (LMS) designed for medical students and aspirants. It integrates video courses, clinical Q-Banks, simulated grand tests, and high-yield study tools." 
    },
    { 
      q: "What study materials are included?", 
      a: "PaceMaker provides access to structured clinical video lectures, case-based Q-Banks, grand test series, clinical flowcharts, radiology image banks, and subject revision guides." 
    },
    { 
      q: "Is there mobile app support?", 
      a: "Yes, PaceMaker is fully responsive across desktop, tablet, and mobile browsers, allowing seamless access to your study materials anywhere." 
    },
    {
      q: "How do subscriptions work?",
      a: "Subscriptions are available based on your target exam or study level with flexible options for test series, question banks, or full learning access."
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
                <Sparkles className="w-4 h-4 text-[#0FFCBE]" />
                <span className="text-xs font-bold uppercase tracking-widest">Medical Learning Management System</span>
              </div>

              <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-black text-white leading-[1.08] tracking-tight mb-5 font-display">
                Unleash the Physician <br className="hidden sm:inline" />
                in You with <span className="text-[#0FFCBE]">PaceMaker</span>
              </h1>

              <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed max-w-xl font-normal">
                Access structured video lectures, case-based Q-Banks, simulated grand tests, and clinical study materials in one platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
                <Link 
                  href="/register" 
                  className="bg-[#0FFCBE] hover:bg-white text-[#0B2545] font-black px-7 py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#0FFCBE]/25 flex items-center justify-center gap-2.5 compact-btn group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#services" 
                  className="border border-white/30 hover:bg-white/15 text-white font-bold px-7 py-3.5 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 compact-btn transition-all backdrop-blur-sm"
                >
                  <PlayCircle className="w-4 h-4 text-[#0FFCBE]" /> Platform Features
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-white/10 w-full text-xs font-semibold text-white/80">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0FFCBE]" /> Structured MBBS Curriculum
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0FFCBE]" /> High-Yield Q-Bank
                </span>
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#0FFCBE]" /> Case Vignettes
                </span>
              </div>
            </div>

            {/* Right Hero Authentic Medical Study Overview Card */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0FFCBE]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="w-4 h-4 text-[#0FFCBE]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      MBBS Medical Study Suite
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#0FFCBE]/20 text-[#0FFCBE] px-2.5 py-1 rounded-full border border-[#0FFCBE]/30">
                    Active Portal
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#0B2545]/70 rounded-2xl p-4 border border-white/10">
                    <div className="text-[11px] font-bold text-[#0FFCBE] uppercase tracking-wider mb-1">
                      Clinical Vignettes & Q-Bank
                    </div>
                    <p className="text-white/90 leading-relaxed font-normal">
                      Practice case-based questions with detailed explanations and diagnostic key points.
                    </p>
                  </div>

                  <div className="bg-[#0B2545]/70 rounded-2xl p-4 border border-white/10">
                    <div className="text-[11px] font-bold text-[#0FFCBE] uppercase tracking-wider mb-1">
                      Grand Test Simulators
                    </div>
                    <p className="text-white/90 leading-relaxed font-normal">
                      Simulate actual exam conditions with timed question sets and score breakdowns.
                    </p>
                  </div>

                  <div className="bg-[#0B2545]/70 rounded-2xl p-4 border border-white/10">
                    <div className="text-[11px] font-bold text-[#0FFCBE] uppercase tracking-wider mb-1">
                      High-Yield Study Material
                    </div>
                    <p className="text-white/90 leading-relaxed font-normal">
                      Access flowcharts, clinical images, and downloadable revision guides.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70 font-medium">
                  <span>PaceMaker LMS Engine</span>
                  <Link href="/register" className="text-[#0FFCBE] font-bold hover:underline flex items-center gap-1">
                    Explore Portal <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Services / Platform Features Section */}
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
              <Layers className="w-3.5 h-3.5" /> Core Modules
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight font-display">
              Platform Features
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 font-normal">
              Designed to support every phase of medical study, exam preparation, and revision.
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
                    Open Module <ArrowRight className="w-4 h-4" />
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
                <BookOpen className="w-3.5 h-3.5" /> Curriculum
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight font-display">
                Available Courses
              </h2>
            </div>
            <Link 
              href="/pricing" 
              className="text-xs font-bold text-[#106EBE] uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all shrink-0 bg-[#106EBE]/10 px-4 py-2.5 rounded-xl border border-[#106EBE]/20"
            >
              View Plans <ArrowRight className="w-4 h-4" />
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
                <p className="text-base font-bold text-[#0B2545]">No courses published yet</p>
                <p className="text-xs text-slate-500 mt-1">Course offerings will appear here once configured by instructors.</p>
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
                          View Details
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold text-[#106EBE] uppercase tracking-widest bg-[#106EBE]/10 px-2.5 py-1 rounded-md mb-2 inline-block border border-[#106EBE]/20">
                      {course.level || 'Course'}
                    </span>
                    <h4 className="font-bold text-[#0B2545] text-base mb-1 font-display tracking-tight leading-snug truncate group-hover:text-[#106EBE] transition-colors">
                      {course.courseName}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {course.description || `Subject module for ${course.subject}.`}
                    </p>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Methodology Section */}
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
                  <Award className="w-6 h-6 text-[#0FFCBE]" /> System Highlights
                </h4>
                
                <ul className="space-y-4">
                  {[
                    'Clinical vignette practice with distractor analysis',
                    'Subject-wise progress tracking & error analysis',
                    'Simulated exam environments with timers',
                    'Downloadable study resources and revision notes'
                  ].map((text, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-white/90 items-start">
                      <CheckCircle2 className="w-5 h-5 text-[#0FFCBE] shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between text-xs">
                  <span className="text-white/70">PaceMaker Architecture</span>
                  <span className="text-[#0FFCBE] font-bold">LMS Engine</span>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106EBE]/10 text-[#106EBE] text-xs font-bold uppercase tracking-widest mb-3">
                <Stethoscope className="w-3.5 h-3.5" /> Study Methodology
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] tracking-tight leading-[1.1] mb-5 font-display">
                Structured Clinical Learning
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
                PaceMaker combines structured course modules with targeted question practice to reinforce diagnostic reasoning and core concepts.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#0B2545]">
                  <Check className="w-4 h-4 text-[#106EBE]" /> Case-Based Diagnostic Practice
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#0B2545]">
                  <Check className="w-4 h-4 text-[#106EBE]" /> Integrated Subject Progress Tracking
                </div>
              </div>

              <Link 
                href="/register" 
                className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-[#106EBE] hover:bg-[#0B2545] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-md"
              >
                Register Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </motion.section>

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
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FFCBE]" /> Stay Informed
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display mb-3">
            Subscribe to Platform Updates
          </h3>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-md mx-auto mb-8 font-normal">
            Receive updates on new course releases, exam schedules, and learning materials directly in your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto relative">
            <div className="relative flex items-center shadow-xl rounded-2xl bg-white p-1.5">
              <input
                type="email"
                required
                placeholder="Enter your email"
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
              Unsubscribe at any time.
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
              <HelpCircle className="w-3.5 h-3.5" /> Support & FAQs
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight font-display">
              Frequently Asked Questions
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