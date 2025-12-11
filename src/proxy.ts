import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/auth/',
  '/favicon.ico',
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static, _next and public files
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Allow explicit public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get token (NextAuth JWT)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Not authenticated -> redirect to login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token as any).role;

  // RBAC for CASHIER: Restrict to POS and invoice routes only
  if (role === 'CASHIER') {
    // Allow POS and invoice pages
    if (pathname.startsWith('/pos') || pathname.startsWith('/invoice')) {
      return NextResponse.next();
    }

    // Allow read-only product API (needed for POS)
    if (pathname === '/api/products' && req.method === 'GET') {
      return NextResponse.next();
    }

    // Allow sales API (needed for POS)
    if (pathname.startsWith('/api/sales')) {
      return NextResponse.next();
    }

    // Block everything else for Cashiers - redirect to POS
    const posUrl = new URL('/pos', req.url);
    return NextResponse.redirect(posUrl);
  }

  // RBAC for ADMIN: Full access to all routes
  if (role === 'ADMIN') {
    return NextResponse.next();
  }

  // Default: allow access for authenticated users
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
