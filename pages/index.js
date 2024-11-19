// pages/index.js

export async function getStaticProps() {
  return {
    redirect: {
      destination: '/page/1',
      permanent: false, // 임시 리다이렉트 (SEO에 영향을 덜 미침)
    },
  };
}

export default function Home() {
  return null; // 리다이렉트만 수행
}
