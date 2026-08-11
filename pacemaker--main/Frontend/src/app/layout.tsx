import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PaceMaker | The Ultimate Medical LMS',
  description: 'Advanced platform for medical students to prepare for NEET PG, INICET & FMGE.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`antialiased ${plusJakartaSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col pt-16 selection:bg-[#0FFCBE] selection:text-[#106EBE] font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[#FAFAFA] bg-[radial-gradient(rgba(16,110,190,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,110,190,0.04),transparent_40%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,252,190,0.03),transparent_40%)]"></div>
            </div>
            {children}
          </main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
