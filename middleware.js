import { get } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

const SITE_MODES = new Set(['normal', 'updates-paused', 'maintenance']);

function removeLocalePrefix(pathname) {
  const normalized = pathname.replace(/^\/(de|en)(?=\/|$)/, '');
  return normalized || '/';
}

function shouldBypass(pathname) {
  const normalized = removeLocalePrefix(pathname);

  if (normalized === '/maintenance') return true;
  if (normalized === '/robots.txt') return true;
  if (normalized === '/sitemap.xml') return true;

  if (normalized.startsWith('/api/')) return true;
  if (normalized.startsWith('/_next/')) return true;
  if (normalized.startsWith('/sitemap-')) return true;
  if (normalized.startsWith('/icons/')) return true;
  if (normalized.startsWith('/images/')) return true;

  // 정적 파일은 Edge Config를 읽지 않는다.
  return /\.[a-zA-Z0-9]+$/.test(normalized);
}

async function readSiteMode() {
  if (!process.env.EDGE_CONFIG) {
    return 'normal';
  }

  try {
    const mode = await get('siteMode');
    return SITE_MODES.has(mode) ? mode : 'normal';
  } catch (error) {
    console.error(
      'Edge Config siteMode read failed. Falling back to normal mode.',
      error
    );

    return 'normal';
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const siteMode = await readSiteMode();

  if (siteMode === 'maintenance') {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = '/maintenance';

    return NextResponse.rewrite(maintenanceUrl);
  }

  const response = NextResponse.next();

  response.cookies.set('hy-site-mode', siteMode, {
    path: '/',
    maxAge: 300,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export const config = {
  matcher: '/:path*',
};
