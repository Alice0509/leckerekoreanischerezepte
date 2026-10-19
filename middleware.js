import { NextResponse } from 'next/server';

export function middleware(request) {
  // Match exact legacy spellings before static route lookup (fallback:false).
  // Config redirects are case insensitive, so keep these checks here to avoid
  // redirecting canonical lowercase paths back to themselves.
  const legacyPaths = {
    '/ingredients/Gochujang': '/ingredients/gochujang',
    '/ingredients/ Tofu': '/ingredients/tofu',
    '/ingredients/MincedGarlic': '/ingredients/minced-garlic',
    '/ingredients/Typ 550': '/ingredients/wheat-flour-type-550',
  };
  let pathname;
  try {
    pathname = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return NextResponse.next();
  }
  const canonicalPath = Object.hasOwn(legacyPaths, pathname)
    ? legacyPaths[pathname]
    : null;
  if (!canonicalPath) {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  const productionHosts = [
    'www.hansikyoung.com',
    'www.leckere-koreanische-rezepte.de',
  ];
  const destination = productionHosts.includes(host)
    ? new URL(`https://${host}${canonicalPath}`)
    : request.nextUrl.clone();
  destination.pathname = canonicalPath;
  destination.search = request.nextUrl.search;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: '/ingredients/:slug',
};
