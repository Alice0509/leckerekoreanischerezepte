import { NextResponse } from 'next/server';

const LOCALE_ORIGINS = {
  de: 'https://www.leckere-koreanische-rezepte.de',
  en: 'https://www.hansikyoung.com',
};

export function middleware(request) {
  const incomingUrl = new URL(request.url);
  const match = incomingUrl.pathname.match(/^\/(de|en)(?=\/|$)/);

  if (!match) {
    return NextResponse.next();
  }

  const locale = match[1];
  const strippedPath = incomingUrl.pathname.slice(locale.length + 1) || '/';

  const destination = new URL(strippedPath, LOCALE_ORIGINS[locale]);
  destination.search = incomingUrl.search;

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: [
    {
      source: '/de/:route*',
      locale: false,
    },
    {
      source: '/en/:route*',
      locale: false,
    },
  ],
};
