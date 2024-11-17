// components/Layout.js
import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from '../styles/Layout.module.css';

const Layout = ({ children, title, description, ogImage }) => {
  return (
    <>
      <Head>
        <title>{title ? title : 'Korean Recipes'}</title>
        <meta
          name="description"
          content={
            description ? description : 'A multilingual Korean recipes website.'
          }
        />
        <meta
          property="og:title"
          content={title ? title : 'Leckere Koreanische Rezepte'}
        />
        <meta
          property="og:description"
          content={
            description ? description : 'A multilingual Korean recipes website.'
          }
        />
        <meta
          property="og:image"
          content={ogImage ? ogImage : '/images/default-og-image.png'}
        />
        <link rel="icon" href="/favicon.png" />
        {/* 추가적인 메타 태그를 여기에 추가할 수 있습니다 */}
      </Head>
      <Header />
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
