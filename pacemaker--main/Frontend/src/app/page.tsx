'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, ChevronRight, Star, Users, Award, 
  BookOpen, BarChart3, Play, Zap, CheckCircle2, Clock, Shield,
  MessageSquare, Activity, PlayCircle, Send, GraduationCap, Layers, Brain, TrendingUp,
  Target, Sparkles, ChevronLeft, Heart, ExternalLink, ArrowRight,
  Check, Globe, Phone, Mail, Loader2, AlertCircle, Info,
  BookMarked
} from 'lucide-react';
import { courseService, Course } from '@/services/courseService';
import apiClient from '@/lib/apiClient';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as any } }
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
};

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    courseService.getAllCourses()
      .then(data => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const coreServices = [
    {
      title: 'Live Ecosystem',
      desc: 'Interactive live coaching sessions by top medical consultants.',
      icon: <Activity className="w-5 h-5 text-[#106EBE]" />,
      href: '/register',
      badge: 'Real-time'
    },
    {
      title: 'Intelligent Q-Bank',
      desc: 'Customizable question bank featuring dynamic clinical advice.',
      icon: <BookOpen className="w-5 h-5 text-[#106EBE]" />,
      href: '/register',
      badge: 'AI Powered'
    },
    {
      title: 'Simulated Exams',
      desc: 'Realistic NEET PG/INICET simulators with predictive ranking.',
      icon: <Users className="w-5 h-5 text-[#106EBE]" />,
      href: '/register',
      badge: 'National Rank'
    },
  ];

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);

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

  const faqs = [
    { q: "What is PaceMaker Academy?", a: "A premier LMS explicitly for medical aspirants merging video modules, Q-Banks, and grand test series." },
    { q: "How does the AI Tutor work?", a: "It utilizes a medical RAG engine to explain clinical vignettes and critique diagnostic paths instantly." },
    { q: "Mobile app support?", a: "Yes, our React Native app supports streaming, offline Q-Banks, and performance indicators." }
  ];

  return (
    <div className="flex-1 flex flex-col w-full relative">
      <div className="absolute top-8 left-1/4 w-[200px] h-[200px] rounded-full bg-[#0FFCBE]/20 blur-[80px] -z-10 animate-float-slow"></div>

      {/* Hero Section - Compact padding (py-10 md:py-14) & Tighter Gap */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-[#106EBE] border-b border-white/10 relative overflow-hidden shadow-xl py-10 md:py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Hero Content */}
            <div className="lg:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0FFCBE]/10 border border-[#0FFCBE]/20 text-[#0FFCBE] mb-4">
                <Sparkles className="w-4 h-4 text-[#0FFCBE]" />
                <span className="text-xs font-bold uppercase tracking-widest">Less of the same, more of the unique</span>
              </div>

              <h1 className="text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] font-extrabold text-white leading-[1.05] tracking-tight mb-3 font-display">
                Unleash the Physician <br className="hidden sm:inline" />
                in You with <span className="text-[#0FFCBE]">PaceMaker</span>
              </h1>

              <p className="text-base sm:text-lg text-white/90 mb-6 leading-relaxed max-w-lg font-medium">
                Immerse yourself in premium clinical videos, solve customized case-based Q-Banks, and consult our interactive AI Tutor.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/register" className="bg-[#0FFCBE] hover:bg-white text-[#106EBE] font-bold px-6 py-3 rounded-lg text-sm uppercase tracking-widest transition-all shadow-md shadow-[#0FFCBE]/20 flex items-center justify-center gap-2 compact-btn">
                  Join Academy <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#services" className="border border-white/30 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2 compact-btn transition-colors">
                  <PlayCircle className="w-4 h-4 text-[#0FFCBE]" /> Learn More
                </Link>
              </div>
            </div>

            {/* Empty placeholder to maintain layout balance */}
            <div className="lg:col-span-5 w-full flex justify-center mt-8 lg:mt-0"></div>

          </div>
        </div>
      </motion.section>

      {/* Services Section - Tighter Grid & Margins */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        id="services"
        className="px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-[#FAFAFA] border-y border-[#106EBE]/10 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xs font-bold text-[#106EBE] uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#106EBE]"></span> Core Ecosystem
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#106EBE] tracking-tight font-display">
              Built to Disrupt Medical Ed
            </p>
          </div>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {coreServices.map((service, idx) => (
              <motion.div variants={cardVariants} key={idx}>
                <Link
                  href={service.href}
                  className="group p-5 rounded-2xl border border-[#106EBE]/10 bg-white hover:shadow-md hover:border-[#106EBE]/30 transition-all flex flex-col justify-between h-full compact-card"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#106EBE]/5 flex items-center justify-center group-hover:bg-[#106EBE]/10 transition-colors">
                        {service.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest bg-[#0FFCBE]/20 text-[#106EBE] px-2.5 py-1 rounded-sm border border-[#0FFCBE]/40">
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#106EBE] mb-2 font-display tracking-tight">{service.title}</h3>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed mb-4">{service.desc}</p>
                  </div>
                  <div className="text-sm font-bold text-[#106EBE] uppercase tracking-widest flex items-center gap-1.5 group-hover:opacity-70 transition-all">
                    Launch Portal <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Courses Section - Compact Cards & Reduced Gaps */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        id="courses"
        className="px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xs font-bold text-[#106EBE] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#106EBE]"></span> Curriculum
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#106EBE] tracking-tight font-display">
                Professional Courses
              </p>
            </div>
            <Link href="/pricing" className="text-sm font-bold text-[#106EBE] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-all shrink-0">
              View Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#106EBE]/10 p-3 shadow-sm animate-pulse">
                  <div className="aspect-video bg-[#106EBE]/5 rounded-lg mb-3" />
                  <div className="h-2 bg-[#106EBE]/10 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-[#106EBE]/20 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-[#106EBE]/10 rounded w-1/2" />
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-4 text-center py-8 text-slate-500 font-medium bg-[#106EBE]/5 rounded-xl border border-dashed border-[#106EBE]/20">
                <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#106EBE]" />
                <p className="text-sm font-semibold">No courses available yet.</p>
              </div>
            ) : (
              courses.map((course, idx) => (
                <motion.div variants={cardVariants} key={course.id}>
                  <Link
                    href="/pricing"
                    className="bg-white rounded-xl border border-[#106EBE]/10 p-3 shadow-sm hover:shadow-md hover:border-[#106EBE]/30 transition-all block compact-card"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#106EBE]/5 to-[#0FFCBE]/10 rounded-lg mb-3 overflow-hidden relative">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.courseName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {course.subject}
                        </div>
                      )}
                        <div className="absolute inset-0 bg-[#106EBE]/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-[#0FFCBE] text-[#106EBE] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-md">
                            Unlock
                          </span>
                        </div>
                    </div>

                    <span className="text-xs font-bold text-[#106EBE] uppercase tracking-widest bg-[#106EBE]/10 px-2 py-0.5 rounded-sm mb-2 inline-block">
                      {course.level}
                    </span>
                    <h4 className="font-bold text-[#106EBE] text-base mb-1 font-display tracking-tight leading-snug truncate">{course.courseName}</h4>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* RAG Section - Compact Layout */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-[#FAFAFA] border-t border-[#106EBE]/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-sm bg-[#106EBE] p-5 rounded-2xl border-4 border-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#0FFCBE]/20 blur-2xl rounded-full"></div>
                <h4 className="text-white font-bold text-xl mb-4 flex items-center gap-2 font-display">
                  <Award className="w-5 h-5 text-[#0FFCBE]" /> High-yield Engine
                </h4>
                <ul className="space-y-3">
                  {[
                    'Smart spacing filters out redundant concepts',
                    '2000+ interactive clinical vignettes',
                    'Real-time detailed score tracking',
                    'Personalized clinical PDF notes'
                  ].map((text, idx) => (
                    <li key={idx} className="flex gap-2.5 text-sm text-white/90 items-start">
                      <CheckCircle2 className="w-4 h-4 text-[#0FFCBE] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-xs font-bold text-[#106EBE] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#106EBE]"></span> Pedagogy
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#106EBE] tracking-tight leading-[1.1] mb-4 font-display">
                Mirror Real-world Decisions
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                We focus on diagnostic accuracy and physiological correlations. Develop the clinical reflexes required to top entrance exams and treat patients effectively.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-[#106EBE] uppercase tracking-widest hover:opacity-70 transition-all">
                Explore Curriculum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Newsletter - Tight form container */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#106EBE] text-white"
      >
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Mail className="w-6 h-6 text-[#0FFCBE] mx-auto mb-3" />
          <h2 className="text-xs font-bold text-[#0FFCBE] uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FFCBE]"></span> Stay Ahead
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-4">
            Medical High-Yields
          </p>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md mx-auto mb-6">
            Get weekly summaries, guides, and mock breakdowns delivered to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-sm mx-auto relative">
            <div className="relative flex items-center shadow-lg rounded-lg bg-white p-1">
              <input
                type="email"
                required
                placeholder="doctor@institution.edu"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-transparent border-none px-3 py-2.5 text-sm text-[#106EBE] placeholder-[#106EBE]/50 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={newsSubmitting || newsSuccess}
                className="px-5 py-2.5 bg-[#0FFCBE] hover:bg-[#00E5A8] text-[#106EBE] rounded font-bold text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-wider"
              >
                {newsSubmitting ? (
                  <span className="w-3 h-3 border-2 border-[#106EBE]/30 border-t-[#106EBE] rounded-full animate-spin" />
                ) : newsSuccess ? (
                  <>Joined <CheckCircle2 className="w-3 h-3" /></>
                ) : (
                  <>Send <Send className="w-3 h-3" /></>
                )}
              </button>
            </div>
            {newsSuccess && (
              <p className="text-xs text-[#0FFCBE] font-bold uppercase tracking-widest mt-2 animate-pulse">
                Check inbox to confirm!
              </p>
            )}
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </motion.section>

      {/* FAQ - Tighter Accordions */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-white"
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold text-[#106EBE] uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#106EBE]"></span> Help & Support
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#106EBE] tracking-tight font-display">
              FAQ
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#106EBE] shadow-sm' : 'border-[#106EBE]/20'}`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-4 py-3 text-left flex justify-between items-center gap-3 hover:bg-[#106EBE]/5 transition-colors"
                  >
                    <span className="text-base font-bold font-display tracking-tight text-[#106EBE]">
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-[#106EBE] text-[#0FFCBE]' : 'bg-[#106EBE]/10 text-[#106EBE]'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-0 text-sm text-slate-600 leading-relaxed">
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