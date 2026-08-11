'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, Phone, GraduationCap, 
  ArrowRight, Building2, MapPin, Globe, 
  Briefcase, BookOpen, Clock, Check
} from 'lucide-react';
import { syncUserWithForum } from '@/lib/forumService';
import { authService } from '@/services/authService';
import { ACADEMIC_LEVELS, getLevel, ACADEMIC_LEVEL_OPTIONS } from '@/lib/academicLevels';

function RegisterPageContent() {
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/pricing';

  // Student-specific fields
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    collegeName: '',
    state: '',
    city: '',
    enrollSubject: '',
    enrollDuration: '',
    academicLevelId: '',
    specialization: '',
  });

  // Instructor-specific fields (Comprehensive)
  const [instructorData, setInstructorData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    nationality: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    specialization: '',
    subSpecialization: '',
    qualification: '',
    college: '',
    graduationYear: '',
    experience: '',
    designation: '',
    hospital: '',
    teachingExperience: '',
    password: '',
    stateMedicalCouncil: '',
    medicalCouncilNumber: '',
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string | boolean>>({
    medicalCert: false,
    aadharCard: false,
    cv: false,
  });

  const [uploadedDocNames, setUploadedDocNames] = useState({
    medicalCertName: '',
    aadharCardName: '',
    cvName: '',
  });

  const [isCouncilValidating, setIsCouncilValidating] = useState(false);
  const [isCouncilValid, setIsCouncilValid] = useState<boolean | null>(null);

  const handleValidateCouncil = () => {
    setIsCouncilValidating(true);
    setTimeout(() => {
      setIsCouncilValidating(false);
      setIsCouncilValid(instructorData.medicalCouncilNumber.length > 4);
    }, 1000);
  };
  
  const handleFileUpload = async (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadedDocs(prev => ({ ...prev, [docName]: 'uploading' }));
      
      try {
        const response = await fetch('/api/upload-doc', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success && data.filename) {
          setUploadedDocs(prev => ({ ...prev, [docName]: true }));
          setUploadedDocNames(prev => ({ ...prev, [`${docName}Name`]: data.filename }));
        } else {
          setUploadedDocs(prev => ({ ...prev, [docName]: false }));
          alert(data.error || 'Failed to upload document');
        }
      } catch (err) {
        console.error("Upload error", err);
        setUploadedDocs(prev => ({ ...prev, [docName]: false }));
        alert('An error occurred during file upload');
      }
    }
  };

  const [instructorStep, setInstructorStep] = useState(1);
  const totalInstructorSteps = 5;

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleInstructorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInstructorData({ ...instructorData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const userData = role === 'student' ? studentData : instructorData;
      const fullName = `${userData.firstName} ${userData.lastName}`;
      
      // Call backend API
      await authService.register({
        ...userData,
        ...(role === 'instructor' ? uploadedDocNames : {}),
        name: fullName,
        email: userData.email,
        password: userData.password,
        role: role.toUpperCase(), // Backend expects uppercase usually
      });
      
      // Optional: Store additional metadata locally if needed for UI
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      storedUsers[userData.email] = { 
        ...userData,
        ...(role === 'instructor' ? uploadedDocNames : {}),
        fullName: fullName,
        role: role,
        status: role === 'instructor' ? 'pending' : 'approved',
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
      const levelId = role === 'student' ? studentData.academicLevelId : '';
      if (levelId) {
        localStorage.setItem('academicLevelId', levelId);
      }
      
      // Auto-create/sync forum account on registration
      const userUsername = userData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      syncUserWithForum(userData.email, fullName, userUsername, role);
      
      if (role === 'instructor') {
        router.push(`/login?registered=true&email=${encodeURIComponent(userData.email)}&role=instructor`);
      } else {
        router.push(`/login?registered=true&email=${encodeURIComponent(userData.email)}&role=student&redirect=${encodeURIComponent(redirectTo)}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 bg-[#fdfbf7]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full md:max-w-[700px] glass-panel rounded-[3rem] p-5 md:p-8 shadow-2xl relative overflow-hidden bg-white border border-gray-200"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl z-0"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-1 tracking-tight">Create Your Account</h2>
          <p className="text-center text-gray-600 font-medium text-sm mb-6">Select your role to begin your medical journey.</p>
          
          {/* Role Selector */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6 max-w-sm mx-auto border border-gray-200">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${role === 'student' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              I am a Student
            </button>
            <button 
              onClick={() => setRole('instructor')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${role === 'instructor' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              I am an Instructor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Common Fields */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" name="firstName" required
                    value={role === 'student' ? studentData.firstName : instructorData.firstName}
                    onChange={role === 'student' ? handleStudentChange : handleInstructorChange}
                    className="w-full pl-10 pr-3.5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 text-sm placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" name="lastName" required
                    value={role === 'student' ? studentData.lastName : instructorData.lastName}
                    onChange={role === 'student' ? handleStudentChange : handleInstructorChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" name="email" required
                    value={role === 'student' ? studentData.email : instructorData.email}
                    onChange={role === 'student' ? handleStudentChange : handleInstructorChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" name="password" required
                    value={role === 'student' ? studentData.password : instructorData.password}
                    onChange={role === 'student' ? handleStudentChange : handleInstructorChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            <AnimatePresence mode="wait">
              {role === 'student' ? (
                <motion.div 
                  key="student-fields" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="tel" name="phone" required
                          value={studentData.phone} onChange={handleStudentChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                          placeholder="+91 0000000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Academic Level</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select 
                          name="academicLevelId" required
                          value={studentData.academicLevelId} onChange={handleStudentChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 appearance-none"
                        >
                          <option value="">Select Level</option>
                          {ACADEMIC_LEVEL_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">College Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" name="collegeName" required
                          value={studentData.collegeName} onChange={handleStudentChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                          placeholder="College Name"
                        />
                      </div>
                    </div>
                  </div>

                  {studentData.academicLevelId && (
                    <>
                      {/* Subjects */}
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Subjects to Enroll</label>
                        {(() => {
                          const level = getLevel(studentData.academicLevelId);
                          if (!level) return null;
                          if (studentData.academicLevelId === 'pg-entrance') {
                            return (
                              <p className="text-sm font-bold text-gray-600 px-1">
                                All 19 Pre-clinical &amp; Para-clinical subjects are included in the PG Medical Entrance preparation plan.
                              </p>
                            );
                          }
                          return (
                            <div className="grid grid-cols-2 gap-2">
                              {level.subjects.map(sub => (
                                <label key={sub} className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
                                  <input 
                                    type="radio" 
                                    name="enrollSubject"
                                    checked={studentData.enrollSubject === sub}
                                    onChange={() => setStudentData(prev => ({ ...prev, enrollSubject: sub }))}
                                    className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-sm font-bold text-gray-700">{sub}</span>
                                </label>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Enrollment Period */}
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Enrollment Period</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select 
                            name="enrollDuration" required
                            value={studentData.enrollDuration} onChange={handleStudentChange}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 appearance-none"
                          >
                            <option value="">Select Period</option>
                            <option value="1 Month">1 Month</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="12 Months">12 Months</option>
                            <option value="24 Months">24 Months</option>
                          </select>
                        </div>
                      </div>

                      {/* Specialization (Postgraduate only) */}
                      {studentData.academicLevelId === 'postgraduate' && (() => {
                        const level = getLevel('postgraduate');
                        if (!level?.specialtyOptions) return null;
                        return (
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Specialty</label>
                            <div className="relative">
                              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <select 
                                name="specialization" required
                                value={studentData.specialization} onChange={handleStudentChange}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 appearance-none"
                              >
                                <option value="">Select Specialty</option>
                                {level.specialtyOptions.map(spec => (
                                  <option key={spec} value={spec}>{spec}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Learning Supports */}
                      {(() => {
                        const level = getLevel(studentData.academicLevelId);
                        if (!level?.supports?.length) return null;
                        return (
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Learning Supports Included</label>
                            <div className="flex flex-wrap gap-2">
                              {level.supports.map(support => (
                                <div key={support} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50/50 border border-primary-100">
                                  <Check className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                                  <span className="text-sm font-bold text-gray-700">{support}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">State</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" name="state" required
                          value={studentData.state} onChange={handleStudentChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" name="city" required
                          value={studentData.city} onChange={handleStudentChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                          placeholder="City"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="instructor-fields" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${instructorStep >= s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                          {s}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${instructorStep === s ? 'text-primary-600' : 'text-gray-400'}`}>
                          {s === 1 ? 'Personal' : s === 2 ? 'Contact' : s === 3 ? 'Professional' : s === 4 ? 'Position' : 'Documents'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* STEP 1: PERSONAL INFORMATION */}
                  {instructorStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Date of Birth</label>
                            <input type="date" name="dob" required value={instructorData.dob} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" />
                         </div>
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Gender</label>
                            <select name="gender" required value={instructorData.gender} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                               <option value="">Select Gender</option>
                               <option value="Male">Male</option>
                               <option value="Female">Female</option>
                               <option value="Other">Other</option>
                            </select>
                         </div>
                       </div>
                       <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nationality</label>
                          <select name="nationality" required value={instructorData.nationality} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                             <option value="">Select Nationality</option>
                             <option value="Indian">Indian</option>
                             <option value="American">American</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                    </motion.div>
                  )}

                  {/* STEP 2: CONTACT INFORMATION */}
                  {instructorStep === 2 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Mobile Number</label>
                            <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <input type="tel" name="phone" required value={instructorData.phone} onChange={handleInstructorChange} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="+91 00000 00000" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Alternate Mobile</label>
                            <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <input type="tel" name="altPhone" value={instructorData.altPhone} onChange={handleInstructorChange} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="Optional" />
                            </div>
                         </div>
                       </div>
                       <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Full Address</label>
                          <div className="relative">
                             <MapPin className="absolute left-4 top-6 w-5 h-5 text-gray-400" />
                             <textarea name="address" required value={instructorData.address} onChange={(e) => setInstructorData({...instructorData, address: e.target.value})} rows={3} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 resize-none" placeholder="Street, City, State, Pincode" />
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {/* STEP 3: PROFESSIONAL INFORMATION */}
                  {instructorStep === 3 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Specialization</label>
                            <select name="specialization" required value={instructorData.specialization} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                               <option value="">Select Specialization</option>
                               <option value="Cardiology">Cardiology</option>
                               <option value="Neurology">Neurology</option>
                               <option value="Oncology">Oncology</option>
                               <option value="Surgery">Surgery</option>
                               <option value="Pediatrics">Pediatrics</option>
                               <option value="Orthopedics">Orthopedics</option>
                               <option value="Dermatology">Dermatology</option>
                               <option value="Psychiatry">Psychiatry</option>
                               <option value="General Medicine">General Medicine</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Sub-Specialization</label>
                            <select name="subSpecialization" required value={instructorData.subSpecialization} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                               <option value="">Select Sub-Specialization</option>
                               <option value="Interventional">Interventional</option>
                               <option value="Non-Interventional">Non-Interventional</option>
                               <option value="Pediatric">Pediatric</option>
                               <option value="Adult">Adult</option>
                               <option value="Surgical">Surgical</option>
                               <option value="Clinical">Clinical</option>
                               <option value="Preventive">Preventive</option>
                               <option value="Diagnostic">Diagnostic</option>
                            </select>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Highest Qualification</label>
                            <select name="qualification" required value={instructorData.qualification} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                               <option value="">Select Qualification</option>
                               <option value="MBBS">MBBS</option>
                               <option value="MD">MD</option>
                               <option value="MS">MS</option>
                               <option value="DM">DM</option>
                               <option value="MCh">MCh</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">College/University</label>
                            <input type="text" name="college" required value={instructorData.college} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="AIIMS, JIPMER, etc." />
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Year of Graduation</label>
                            <input type="number" name="graduationYear" required value={instructorData.graduationYear} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="e.g. 2010" />
                         </div>
                         <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Years of Experience</label>
                            <input type="number" name="experience" required value={instructorData.experience} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="Total Years" />
                         </div>
                       </div>
                    </motion.div>
                  )}

                  {/* STEP 4: CURRENT POSITION */}
                  {instructorStep === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Current Designation</label>
                          <input type="text" name="designation" required value={instructorData.designation} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="Senior Consultant, Professor, etc." />
                       </div>
                       <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Current Hospital/Institute</label>
                          <input type="text" name="hospital" required value={instructorData.hospital} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="Apollo, Fortis, etc." />
                       </div>
                       <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Teaching Experience</label>
                          <input type="text" name="teachingExperience" required value={instructorData.teachingExperience} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="e.g. 8 years" />
                       </div>
                    </motion.div>
                  )}

                  {/* STEP 5: DOCUMENTS */}
                  {instructorStep === 5 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4 mb-4">
                          <BookOpen className="w-6 h-6 text-primary-600 mt-1 shrink-0" />
                          <div>
                             <h4 className="font-black text-primary-900 text-sm">Almost Finished!</h4>
                             <p className="text-xs text-primary-700 font-medium">Please provide your medical registration details and documents.</p>
                          </div>
                       </div>
                       
                       <div className="space-y-5">
                          {/* 1) State Medical Council */}
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">1. State Medical Council</label>
                             <select name="stateMedicalCouncil" required value={instructorData.stateMedicalCouncil} onChange={handleInstructorChange} className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900">
                                <option value="">Select State Council</option>
                                <option value="Andhra Pradesh Medical Council">Andhra Pradesh Medical Council</option>
                                <option value="Delhi Medical Council">Delhi Medical Council</option>
                                <option value="Gujarat Medical Council">Gujarat Medical Council</option>
                                <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                                <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                                <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                                <option value="Other">Other</option>
                             </select>
                          </div>

                          {/* 2) Medical Certificate Upload */}
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">2. Medical Certificate Upload</label>
                              <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex items-center justify-between ${uploadedDocs.medicalCert === true ? 'border-green-400 bg-green-50' : uploadedDocs.medicalCert === 'uploading' ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-gray-200 hover:border-primary-300 bg-gray-50/50'}`}>
                                 <span className={`text-xs font-bold ${uploadedDocs.medicalCert === true ? 'text-green-600' : uploadedDocs.medicalCert === 'uploading' ? 'text-amber-600' : 'text-gray-500'}`}>
                                   {uploadedDocs.medicalCert === true ? 'Certificate Uploaded Successfully' : uploadedDocs.medicalCert === 'uploading' ? 'Uploading certificate...' : 'PDF, JPG, PNG supported'}
                                 </span>
                                 <input type="file" onChange={(e) => handleFileUpload('medicalCert', e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={uploadedDocs.medicalCert === 'uploading'} />
                                 <button type="button" className={`px-4 py-2 bg-white border rounded-xl text-xs font-black transition-colors z-10 ${uploadedDocs.medicalCert === true ? 'border-green-200 text-green-700' : 'border-gray-200 text-primary-600'}`}>
                                   {uploadedDocs.medicalCert === true ? 'Change' : uploadedDocs.medicalCert === 'uploading' ? '...' : 'Browse'}
                                 </button>
                              </div>
                           </div>

                           {/* 3) State Medical Council Number & Validation */}
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">3. State Medical Council Number</label>
                              <div className="flex gap-3">
                                 <input type="text" name="medicalCouncilNumber" value={instructorData.medicalCouncilNumber} onChange={handleInstructorChange} className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900" placeholder="Enter Registration Number" />
                                 <button type="button" onClick={handleValidateCouncil} className="px-6 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all whitespace-nowrap min-w-[120px]">
                                    {isCouncilValidating ? 'Validating...' : isCouncilValid === true ? 'Verified ✓' : isCouncilValid === false ? 'Invalid ✗' : 'Validate'}
                                 </button>
                              </div>
                              {isCouncilValid === true && <p className="text-xs text-green-600 font-bold mt-2 px-1">Number validated successfully.</p>}
                              {isCouncilValid === false && <p className="text-xs text-red-500 font-bold mt-2 px-1">Could not validate number. Please check and try again.</p>}
                           </div>

                           {/* 4) Aadhar Card Upload */}
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">4. Aadhar Card</label>
                              <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex items-center justify-between ${uploadedDocs.aadharCard === true ? 'border-green-400 bg-green-50' : uploadedDocs.aadharCard === 'uploading' ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-gray-200 hover:border-primary-300 bg-gray-50/50'}`}>
                                 <span className={`text-xs font-bold ${uploadedDocs.aadharCard === true ? 'text-green-600' : uploadedDocs.aadharCard === 'uploading' ? 'text-amber-600' : 'text-gray-500'}`}>
                                   {uploadedDocs.aadharCard === true ? 'Aadhar Uploaded Successfully' : uploadedDocs.aadharCard === 'uploading' ? 'Uploading Aadhar...' : 'PDF, JPG, PNG supported'}
                                 </span>
                                 <input type="file" onChange={(e) => handleFileUpload('aadharCard', e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={uploadedDocs.aadharCard === 'uploading'} />
                                 <button type="button" className={`px-4 py-2 bg-white border rounded-xl text-xs font-black transition-colors z-10 ${uploadedDocs.aadharCard === true ? 'border-green-200 text-green-700' : 'border-gray-200 text-primary-600'}`}>
                                   {uploadedDocs.aadharCard === true ? 'Change' : uploadedDocs.aadharCard === 'uploading' ? '...' : 'Browse'}
                                 </button>
                              </div>
                           </div>

                           {/* 5) CV / Resume Upload */}
                           <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">5. CV / Resume Upload</label>
                              <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex items-center justify-between ${uploadedDocs.cv === true ? 'border-green-400 bg-green-50' : uploadedDocs.cv === 'uploading' ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-gray-200 hover:border-primary-300 bg-gray-50/50'}`}>
                                 <span className={`text-xs font-bold ${uploadedDocs.cv === true ? 'text-green-600' : uploadedDocs.cv === 'uploading' ? 'text-amber-600' : 'text-gray-500'}`}>
                                   {uploadedDocs.cv === true ? 'CV / Resume Uploaded Successfully' : uploadedDocs.cv === 'uploading' ? 'Uploading CV...' : 'PDF, DOC, DOCX supported'}
                                 </span>
                                 <input type="file" onChange={(e) => handleFileUpload('cv', e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={uploadedDocs.cv === 'uploading'} />
                                 <button type="button" className={`px-4 py-2 bg-white border rounded-xl text-xs font-black transition-colors z-10 ${uploadedDocs.cv === true ? 'border-green-200 text-green-700' : 'border-gray-200 text-primary-600'}`}>
                                   {uploadedDocs.cv === true ? 'Change' : uploadedDocs.cv === 'uploading' ? '...' : 'Browse'}
                                 </button>
                              </div>
                           </div>

                       </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons for Instructor */}
                  <div className="flex gap-4 pt-4">
                    {instructorStep > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setInstructorStep(prev => prev - 1)}
                        className="flex-1 py-4 border-2 border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-900 rounded-2xl font-black text-sm transition-all"
                      >
                        Back
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => {
                        if (instructorStep < totalInstructorSteps) {
                          setInstructorStep(prev => prev + 1);
                        } else {
                          const form = document.querySelector('form');
                          if (form) form.requestSubmit();
                        }
                      }}
                      className="flex-[2] py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3"
                    >
                      {instructorStep === totalInstructorSteps ? (isSubmitting ? 'Finalizing...' : 'Complete Registration') : 'Next Step'} 
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {role === 'student' && (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight className="w-6 h-6" />
              </button>
            )}
          </form>

          <p className="mt-10 text-center text-sm text-gray-600 font-bold">
            Already registered?{' '}
            <Link href="/login" className="font-black text-primary-600 hover:text-primary-500 transition-colors">
              Sign in to your account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
