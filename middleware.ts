import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isAdminRoute = path.startsWith('/admin');

    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};