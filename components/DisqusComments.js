// components/DisqusComments.js

import React from 'react';
import { DiscussionEmbed } from 'disqus-react';
import { useRouter } from 'next/router';

const DisqusComments = ({ post }) => {
  const router = useRouter();
  const { asPath } = router;

  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

  // 환경 변수 검증
  if (!disqusShortname) {
    console.error('Disqus shortname is not defined. Please set NEXT_PUBLIC_DISQUS_SHORTNAME in .env.local');
    return null;
  }

  // post 객체 검증
  if (!post || !post.id || !post.title) {
    console.error('Post data is incomplete. Ensure post has id and title.');
    return null;
  }

  const disqusConfig = {
    url: process.env.NODE_ENV === 'development'
      ? `http://localhost:3000${asPath}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}${asPath}`,
    identifier: post.id,
    title: post.title,
  };

  return <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />;
};

export default DisqusComments;
