'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  ArrowRight, 
  Activity, 
  BookOpen, 
  Users, 
  Sparkles, 
  MessageSquare, 
  Bot, 
  ChevronDown, 
  CheckCircle2, 
  Video, 
  Award, 
  GraduationCap,
  BookMarked,
  Mail,
  Send
} from 'lucide-react';
import { courseService, Course } from '@/services/courseService';
import apiClient from '@/lib/apiClient';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  // Interactive Chat Simulator
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [chatResponse, setChatResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatbotPrompts = [
    { 
      text: 'Explain STEMI vs NSTEMI', 
      response: '🏥 **STEMI (ST-Elevation MI):** Complete coronary artery occlusion. Requires immediate emergency reperfusion therapy (PCI or thrombolysis) due to transmural infarction risk.\n\n🔬 **NSTEMI (Non-STEMI):** Partial/subtotal occlusion. Presents with ST depression or T-wave inversion and elevated cardiac enzymes, but no ST-segment elevation. Managed with antiplatelets, anticoagulants, and invasive angiography within 24-72 hours.' 
    },
    { 
      text: 'Anaphylaxis first-line therapy', 
      response: '💉 **First-line treatment:** Intramuscular (IM) Epinephrine (1:1000) administered immediately in the anterolateral thigh.\n\n⚙️ **Dosing:** 0.3 to 0.5 mg in adults; 0.01 mg/kg in pediatric patients. Airway control, high-flow oxygen, and IV fluids should follow immediately.' 
    },
    { 
      text: 'Aspirin mechanism of action', 
      response: '💊 **Mechanism:** Aspirin irreversibly acetylates and inhibits cyclooxygenase-1 (COX-1) and COX-2 enzymes.\n\n🛡️ **Effect:** This stops the production of Thromboxane A2 (a potent platelet aggregator and vasoconstrictor) inside platelets, causing permanent antiplatelet action for their 7-10 day lifespan.' 
    }
  ];

  const handlePromptSelect = (prompt: typeof chatbotPrompts[0]) => {
    if (isTyping) return;
    setSelectedPrompt(prompt.text);
    setIsTyping(true);
    setChatResponse('');
    
    let index = 0;
    const text = prompt.response;
    const interval = setInterval(() => {
      setChatResponse((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('currentUser'));
    // Select first prompt as demo on load
    handlePromptSelect(chatbotPrompts[0]);
    // Fetch courses from backend
    courseService.getAllCourses()
      .then(data => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const coreServices = [
    { 
      title: 'Live Ecosystem', 
      desc: 'Interactive live coaching sessions led by India\'s top medical consultants.', 
      icon: <Activity className="w-6 h-6 text-teal-600" />, 
      href: isLoggedIn ? '/dashboard/live' : '/register',
      badge: 'Real-time'
    },
    { 
      title: 'Intelligent Q-Bank', 
      desc: 'Highly customizable question bank featuring clinical case vignettes and dynamic advice.', 
      icon: <BookOpen className="w-6 h-6 text-teal-600" />, 
      href: isLoggedIn ? '/dashboard/qbank' : '/register',
      badge: 'AI Powered'
    },
    { 
      title: 'Simulated Grand Exams', 
      desc: 'Realistic NEET PG/INICET simulators with hybrid predictive percentile ranking.', 
      icon: <Users className="w-6 h-6 text-teal-600" />, 
      href: isLoggedIn ? '/dashboard/exams' : '/register',
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
      console.error('Newsletter subscription failed:', err);
    } finally {
      setNewsSubmitting(false);
    }
  };

  const faqs = [
    { q: "What is PaceMaker Academy?", a: "PaceMaker is a premier LMS engineered explicitly for medical aspirants. We merge premium clinical video modules, an custom Q-Bank, dynamic grand test series, and simulated interactive patient modules to secure your target residency rank." },
    { q: "How does the AI Clinical Tutor work?", a: "The AI Tutor utilizes a medical vector RAG engine grounded in top-tier textbooks. It explains clinical vignettes, critiques diagnostic paths, and explains wrong choices to accelerate memory retention." },
    { q: "Can I use PaceMaker on my phone?", a: "Absolutely! We support a mobile-first philosophy. Our dedicated Expo React Native application is fully functional, supporting streaming lectures, Q-Banks, performance indicators, and flashnotes offline." }
  ];

  return (
    <div className="flex-1 flex flex-col w-full relative">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-12 left-1/4 w-[280px] h-[280px] rounded-full bg-teal-100/30 blur-3xl -z-10 animate-float-slow"></div>
      <div className="absolute top-96 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-100/20 blur-3xl -z-10 animate-pulse-soft"></div>

      {/* Hero Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Content Block */}
          <div className="lg:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-teal-500/20 text-teal-700 font-semibold text-xs md:text-sm mb-5 animate-pulse-soft">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Next-Gen Intelligent Medical LMS</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 leading-[1.15] mb-4 font-display">
              Unleash the Physician <br className="hidden sm:inline" />
              in You with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">PaceMaker</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-stone-600 mb-8 leading-relaxed max-w-xl">
              Immerse yourself in premium clinical videos, solve customized case-based Q-Banks, and consult our interactive AI Tutor to secure top residency slots.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10">
              <Link href="/register" className="bg-teal-600 text-white hover:bg-teal-700 font-bold px-6 py-3.5 rounded-xl text-base transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 border border-teal-500/30 backdrop-blur-sm">
                Join Academy <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#services" className="glass-button text-stone-950 font-bold px-6 py-3.5 rounded-xl text-base flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-teal-600" /> Learn More
              </Link>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 border-t border-stone-200/60 pt-6 w-full max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900 font-display">45k+</p>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Aspirants</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900 font-display">98.7%</p>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pass Rate</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900 font-display">12M+</p>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">MCQs Done</p>
              </div>
            </div>
          </div>

          {/* Interactive AI Widget Screen (Hero Right) */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md glass-panel p-5 rounded-3xl border border-white/40 shadow-xl relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-stone-200/50 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 font-display">AI Clinical Tutor</h4>
                    <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                      Online • Ready to Teach
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                  Interactive Preview
                </span>
              </div>

              {/* Chat Prompts */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {chatbotPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(p)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all border ${
                      selectedPrompt === p.text 
                        ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                        : 'bg-white/80 text-stone-600 border-stone-200/60 hover:bg-stone-50'
                    }`}
                  >
                    {p.text}
                  </button>
                ))}
              </div>

              {/* Chat Window */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 min-h-[190px] border border-stone-100 relative shadow-inner">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center border border-stone-200/60">
                    <span className="text-[10px] font-black text-stone-500">USER</span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 pt-0.5">{selectedPrompt || 'Click a prompt above...'}</p>
                </div>

                <div className="flex items-start gap-2.5 border-t border-stone-100 pt-3">
                  <div className="w-6 h-6 rounded-md bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed font-medium pt-0.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {chatResponse ? (
                      <div className="whitespace-pre-line text-stone-700 font-sans font-medium">
                        {chatResponse}
                      </div>
                    ) : (
                      <span className="text-stone-400 italic">Thinking...</span>
                    )}
                    {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal-600 animate-pulse"></span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        id="services"
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-white border-y border-stone-200/40 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Core Ecosystem
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-display">
              Services We Provide for Your Success
            </p>
          </div>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {coreServices.map((service, idx) => (
                <motion.div variants={cardVariants} key={idx}>
                    <Link
                      href={service.href}
                      className="group p-6 rounded-2xl border border-stone-100 bg-[#fdfbf7]/40 hover:bg-white hover:shadow-lg hover:border-teal-500/20 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {service.icon}
                          </div>
                          <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                            {service.badge}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2 font-display">{service.title}</h3>
                        <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed mb-4">{service.desc}</p>
                      </div>
                      <div className="text-xs font-bold text-teal-600 flex items-center gap-1.5 group-hover:text-teal-700 group-hover:translate-x-1.5 transition-all">
                        Launch Portal <ArrowRight className="w-3.5 h-3.5" />
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
        viewport={{ once: true, margin: '-60px' }}
        id="courses"
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-gradient-to-b from-[#fafaf9] to-[#f5f2eb]/40"
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Available Curriculum
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-display">
                Professional Medical Courses
              </p>
            </div>
            <Link href="/pricing" className="text-xs sm:text-sm font-bold text-teal-600 flex items-center gap-1.5 hover:translate-x-1 transition-transform shrink-0">
              View Premium Access Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesLoading ? (
              // Skeleton loaders while fetching from DB
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm animate-pulse"
                >
                  <div className="aspect-[4/3] bg-stone-100 rounded-xl mb-4" />
                  <div className="h-3 bg-stone-100 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-stone-400 font-medium">
                <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No courses available yet. Check back soon!</p>
              </div>
            ) : (
              courses.map((course, idx) => (
                <motion.div variants={cardVariants} key={course.id}>
                  <Link
                    href="/pricing"
                    className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm hover:shadow-lg hover:border-teal-400/40 transition-all duration-300 relative group overflow-hidden cursor-pointer block"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 to-blue-50/50 rounded-xl mb-4 overflow-hidden relative">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.courseName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-teal-600/40 uppercase tracking-[0.2em]">
                          {course.subject}
                        </div>
                      )}
                      {!isLoggedIn && (
                        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white text-stone-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-md cursor-default">
                            Unlock Course
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mb-2 inline-block">
                      {course.level}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm md:text-base mb-1 font-display">{course.courseName}</h4>
                    <p className="text-[11px] font-semibold text-stone-400">{course.lectureCount} Lectures</p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-2 group-hover:text-teal-700 group-hover:translate-x-1 transition-all">
                      View Plans <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

        </div>
      </motion.section>

      {/* RAG & AI Integration details (Value prop) */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-white border-t border-stone-200/40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Visual Panel */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-tr from-teal-500/10 to-blue-500/5 p-6 rounded-3xl border border-teal-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-300/20 blur-2xl rounded-full"></div>
                <h4 className="text-stone-900 font-bold text-lg mb-4 flex items-center gap-1.5 font-display">
                  <Award className="w-5 h-5 text-teal-600" /> High-yield Study Engine
                </h4>
                
                <ul className="space-y-3">
                  {[
                    'Smart spacing filters out redundant concepts',
                    '2000+ interactive diagnostic clinical vignettes',
                    'Real-time detailed score tracking per medical subject',
                    'Fast downloads of personalized high-yield clinical PDF notes'
                  ].map((text, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-stone-600 font-medium items-start">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content Panel */}
            <div className="order-1 lg:order-2">
              <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Clinical Pedagogy
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug mb-5 font-display">
                Built to Mirror Real-world Doctor Decision Making
              </h3>
              <p className="text-sm sm:text-base text-stone-500 leading-relaxed font-medium mb-6">
                Our ecosystem isn't just about simple recall. We focus on diagnostic accuracy and physiological correlations. With advanced patient simulation modules and customizable case builders, you develop the clinical reflexes required to top entrance exams and treat patients effectively.
              </p>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700">
                Explore the Curriculum <ArrowRight className="w-4 h-4" />
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
        viewport={{ once: true, margin: '-60px' }}
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-white border-t border-stone-200/40"
      >
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="w-8 h-8 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Stay Ahead
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display mb-3">
            Medical High-Yields
          </p>
          <p className="text-sm text-stone-500 font-medium leading-relaxed max-w-lg mx-auto mb-6">
            Get weekly clinical summaries, diagnostic guides, and mock exam breakdowns delivered to your inbox.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="relative flex items-center">
              <input
                type="email"
                required
                placeholder="doctor@institution.edu"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white border border-stone-200 hover:border-teal-400/40 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all duration-300 shadow-sm"
              />
              <button
                type="submit"
                disabled={newsSubmitting || newsSuccess}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50"
              >
                {newsSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : newsSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {newsSuccess && (
              <p className="text-[10px] text-teal-600 font-medium animate-pulse mt-2">
                Check your inbox to confirm your subscription!
              </p>
            )}
            <p className="text-[10px] text-stone-400 mt-2">
              No spam. Join 12,000+ medical peers. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </motion.section>

      {/* Interactive FAQ Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f5f2eb]/20 border-t border-stone-200/40"
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Help & Support
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="glass-panel border border-stone-200/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-stone-50/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-stone-800 font-display">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-500 leading-relaxed font-medium border-t border-stone-100">
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
