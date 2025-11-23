import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASIC_USER = process.env.BASIC_AUTH_USER || '';
const BASIC_PASS = process.env.BASIC_AUTH_PASS || '';
const REALM = process.env.BASIC_AUTH_REALM || 'ScienceTokyoMap';

function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header) return null;
  const [type, value] = header.split(' ');
  if (type !== 'Basic' || !value) return null;
  try {
    const decoded = atob(value);
    const i = decoded.indexOf(':');
    if (i < 0) return null;
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  if (!BASIC_USER || !BASIC_PASS) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico' || pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    return NextResponse.next();
  }

  const credentials = parseBasicAuth(req.headers.get('authorization'));
  if (credentials && credentials.user === BASIC_USER && credentials.pass === BASIC_PASS) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
