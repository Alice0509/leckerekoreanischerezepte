// components/DisqusComments.js

import React, { useState } from 'react';
import { DiscussionEmbed } from 'disqus-react';
import { useRouter } from 'next/router';

const DisqusComments = ({ post }) => {
  const router = useRouter();
  const { asPath, locale } = router;
  const isGerman = locale === 'de';
  const [isOpen, setIsOpen] = useState(false);

  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;

  if (!disqusShortname || !post || !post.id || !post.title) {
    return null;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.leckere-koreanische-rezepte.de';

  const disqusConfig = {
    url:
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3000${asPath}`
        : `${siteUrl}${asPath}`,
    identifier: post.id,
    title: post.title,
  };

  return (
    <section className="recipe-comments">
      <div className="recipe-comments__intro">
        <h2>
          {isGerman
            ? 'Hast du dieses Rezept ausprobiert?'
            : 'Did you try this recipe?'}
        </h2>
        <p>
          {isGerman
            ? 'Wenn du eine Frage hast oder dir eine kleine Notiz zum Rezept merken möchtest, kannst du hier die Kommentare öffnen.'
            : 'If you have a question or want to leave a small note about this recipe, you can open the comments here.'}
        </p>

        {!isOpen && (
          <button
            type="button"
            className="recipe-comments__button"
            onClick={() => setIsOpen(true)}
          >
            {isGerman ? 'Kommentare öffnen' : 'Open comments'}
          </button>
        )}
      </div>

      {isOpen && (
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      )}

      <style jsx>{`
        .recipe-comments {
          margin-top: 40px;
          padding: 22px;
          border-radius: 16px;
          background: #fffaf4;
          border: 1px solid rgba(120, 80, 45, 0.14);
        }

        .recipe-comments__intro h2 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          color: #2f241f;
        }

        .recipe-comments__intro p {
          margin: 0 0 14px;
          color: #6d5d55;
          line-height: 1.6;
        }

        .recipe-comments__button {
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1.1rem;
          background: #2f241f;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .recipe-comments__button:hover {
          opacity: 0.9;
        }

        @media (max-width: 600px) {
          .recipe-comments {
            margin-top: 28px;
            padding: 16px;
            border-radius: 14px;
          }

          .recipe-comments__intro h2 {
            margin-bottom: 6px;
            font-size: 1.15rem;
            line-height: 1.3;
          }

          .recipe-comments__intro p {
            margin-bottom: 12px;
            font-size: 0.92rem;
            line-height: 1.5;
          }

          .recipe-comments__button {
            padding: 0.68rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
};

export default DisqusComments;
