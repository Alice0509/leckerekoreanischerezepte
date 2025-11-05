// components/InstagramEmbed.js
import { useEffect, useRef } from 'react';

/**
 *  ▸ oEmbed HTML을 직접 주입하지 않고
 *    <blockquote data-instgrm-permalink="..."> 만 만들고
 *    instagram embed.js 로드 & process
 */
export default function InstagramEmbed({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!url || !ref.current) return;

    // ① <blockquote> 생성
    ref.current.innerHTML = `
      <blockquote class="instagram-media"
                  data-instgrm-permalink="${url}"
                  data-instgrm-version="14"
                  style="width:100%;background:#FFF;border:0;margin:0;padding:0;"></blockquote>`;

    // ② instagram JS 한 번만 로드
    if (!window.instgrm) {
      const s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = s.defer = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    } else {
      /** 이미 로드돼 있으면 바로 렌더링 */
      window.instgrm?.Embeds.process();
    }
  }, [url]);

  /** stub div – SSR 시엔 빈 div → Hydration 오류 방지 */
  return <div ref={ref} style={{ minHeight: 330 }} />;
}
