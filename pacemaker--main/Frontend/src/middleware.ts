import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Specifically redirect paths starting with capital I '/Instructor' to lowercase '/instructor'
  if (pathname.startsWith('/Instructor')) {
    const newPath = pathname.replace('/Instructor', '/instructor');
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/Instructor/:path*'],
};
