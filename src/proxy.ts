import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Simple but robust regex to detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Copy headers and set our custom device type header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-device-type', isMobile ? 'mobile' : 'desktop');
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Run proxy on all paths except static files, assets, and APIs
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
