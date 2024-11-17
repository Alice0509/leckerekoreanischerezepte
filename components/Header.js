// components/Header.js
import React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <h1>Leckere Koreanische Rezepte</h1>
      </Link>
    </header>
  );
};

export default Header;
