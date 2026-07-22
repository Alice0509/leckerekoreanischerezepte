import { NextResponse } from 'next/server';

const LOCALE_HOSTS = {
  de: 'www.leckere-koreanische-rezepte.de',
  en: 'www.hansikyoung.com',
};

export function middleware(request) {
  /*
   * request.url을 직접 사용해 사용자가 요청한 원래
   * /de 또는 /en prefix를 보존한 상태로 검사한다.
   */
  const sourceUrl = new URL(request.url);
  const match = sourceUrl.pathname.match(/^\/(de|en)(?:\/(.*))?$/);

  if (!match) {
    return NextResponse.next();
  }

  const locale = match[1];
  const remainingPath = match[2] || '';

  const destination = new URL(sourceUrl.toString());

  destination.protocol = 'https:';
  destination.hostname = LOCALE_HOSTS[locale];
  destination.port = '';
  destination.pathname = remainingPath ? `/${remainingPath}` : '/';

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: [
    {
      source: '/:path*',
      locale: false,
    },
  ],
};
