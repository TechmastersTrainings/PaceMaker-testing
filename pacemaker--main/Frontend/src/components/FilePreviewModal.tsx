'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, ImageIcon, File, EyeOff, BookOpen } from 'lucide-react';

interface Props {
  fileUrl?: string;
  title: string;
  content?: string;
  subject?: string;
  noteType?: string;
  source?: 'student' | 'instructor';
  downloadable?: boolean;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { gradient: string; badge: string; accent: string }> = {
  'Handwritten Notes': { gradient: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-700', accent: 'amber' },
  'Class Notes': { gradient: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-700', accent: 'blue' },
  'Lecture Notes': { gradient: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-100 text-indigo-700', accent: 'indigo' },
  'Summary Notes': { gradient: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700', accent: 'green' },
  'Revision Notes': { gradient: 'from-purple-500 to-pink-600', badge: 'bg-purple-100 text-purple-700', accent: 'purple' },
  'Quick Reference': { gradient: 'from-rose-500 to-red-600', badge: 'bg-rose-100 text-rose-700', accent: 'rose' },
  'Clinical Notes': { gradient: 'from-cyan-500 to-teal-600', badge: 'bg-cyan-100 text-cyan-700', accent: 'cyan' },
  'Textbook Notes': { gradient: 'from-orange-500 to-red-600', badge: 'bg-orange-100 text-orange-700', accent: 'orange' },
};

const DEFAULT_STYLE = { gradient: 'from-primary-500 to-primary-600', badge: 'bg-primary-100 text-primary-700', accent: 'primary' };

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
}

function isPdf(url: string) {
  return /\.pdf(\?.*)?$/i.test(url) || url.startsWith('data:application/pdf');
}

function dataUriToBlobUrl(dataUri: string): string {
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch {
    return dataUri;
  }
}

export default function FilePreviewModal({ fileUrl, title, content, subject, noteType, source, downloadable = true, onClose }: Props) {
  const style = TYPE_STYLES[noteType || ''] || DEFAULT_STYLE;
  const hasFile = !!fileUrl;
  const isDataUri = fileUrl?.startsWith('data:');

  const [displayUrl, setDisplayUrl] = useState(fileUrl || '');

  useEffect(() => {
    if (fileUrl && isDataUri) {
      const blobUrl = dataUriToBlobUrl(fileUrl);
      setDisplayUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    } else {
      setDisplayUrl(fileUrl || '');
    }
  }, [fileUrl]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Colorful Header */}
          <div className={`bg-gradient-to-r ${style.gradient} px-7 py-5 shrink-0`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm shadow-inner">
                  {hasFile && isImage(fileUrl) ? (
                    <ImageIcon className="w-6 h-6 text-white" />
                  ) : hasFile && isPdf(fileUrl) ? (
                    <FileText className="w-6 h-6 text-white" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-extrabold text-2xl truncate">{title}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {noteType && (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${style.badge} inline-block`}>
                        {noteType}
                      </span>
                    )}
                    {subject && (
                      <span className="text-[11px] font-bold text-white/70 px-2.5 py-0.5 rounded-full bg-white/10 inline-block">
                        {subject}
                      </span>
                    )}
                    {source === 'instructor' && (
                      <span className="text-[11px] font-bold text-white/70 px-2.5 py-0.5 rounded-full bg-white/10 inline-block">
                        By Instructor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {hasFile && downloadable && (
                  <a href={fileUrl} download={`${title.replace(/\s+/g, '_')}.pdf`}
                    className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                    title="Download file">
                    <Download className="w-4 h-4 text-white" />
                  </a>
                )}
                <button onClick={onClose}
                  className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Body - Note Content + File Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
            {/* Note Content */}
            {content && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content</span>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {content}
                </div>
              </div>
            )}

            {/* File Preview */}
            {hasFile && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isImage(fileUrl) ? 'Image Preview' : isPdf(fileUrl) ? 'PDF Preview' : 'Attachment'}
                    </span>
                  </div>
                  {!downloadable && (
                    <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Download disabled
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {isImage(fileUrl) ? (
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg">
                      <img
                        src={displayUrl}
                        alt={title}
                        className="max-w-full max-h-[55vh] rounded-lg shadow object-contain"
                      />
                    </div>
                  ) : isPdf(fileUrl) ? (
                    <embed
                      src={displayUrl}
                      type="application/pdf"
                      className="w-full h-[55vh] rounded-lg shadow bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <File className="w-16 h-16 mb-4 opacity-50" />
                      <p className="font-bold text-gray-500">Preview not available</p>
                      <p className="text-sm mt-1">This file format cannot be previewed inline.</p>
                      {downloadable && (
                        <a href={fileUrl} download={`${title.replace(/\s+/g, '_')}.pdf`}
                          className="mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold text-sm flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download File
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!content && !hasFile && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-bold text-gray-400 text-lg">No content available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-400">
              {hasFile
                ? `${isImage(fileUrl) ? 'Image' : isPdf(fileUrl) ? 'PDF Document' : 'File'}${isDataUri ? ` • ${(fileUrl.length / 1024).toFixed(0)} KB` : ''}`
                : 'Text note'
              }
              {subject && ` • ${subject}`}
            </span>
            {!downloadable && hasFile && (
              <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Download not permitted by instructor
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
