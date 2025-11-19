// components/Header.js
import React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoContainer}>
        <Image
          src="/myLogo1.png" // public 폴더에 넣으면 이 경로 그대로!
          alt="Hansik Young Logo"
          width={55}
          height={55}
          className={styles.logoImage}
        />
        <span className={styles.brandName}>Hansik Young</span>
      </Link>
    </header>
  );
};

export default Header;
