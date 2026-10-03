import { NextResponse } from 'next/server';

export function middleware(request) {
  // Config redirects are case insensitive; this legacy URL needs an exact
  // case-sensitive check so the canonical lowercase path never redirects.
  if (request.nextUrl.pathname !== '/ingredients/Gochujang') {
    return NextResponse.next();
  }

  const host = request.headers.get('host');
  const productionHosts = [
    'www.hansikyoung.com',
    'www.leckere-koreanische-rezepte.de',
  ];
  const destination = productionHosts.includes(host)
    ? new URL(`https://${host}/ingredients/gochujang`)
    : request.nextUrl.clone();
  destination.pathname = '/ingredients/gochujang';
  destination.search = request.nextUrl.search;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: '/ingredients/Gochujang',
};
