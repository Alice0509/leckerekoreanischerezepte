// pages/delete-data.js

import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/DeleteData.module.css';

const DeleteData = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot 상태
  const [status, setStatus] = useState(null); // 상태 메시지

  const handleSubmit = (e) => {
    e.preventDefault();

    // Honeypot 필드 검사
    if (honeypot) {
      // 스팸 봇으로 간주하고 처리 중단
      return;
    }

    // 기본 폼 유효성 검사
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    // mailto 링크 생성
    const mailtoLink = `mailto:joan.korean.rezepte@gmail.com?subject=Data%20Deletion%20Request&body=Email:%20${encodeURIComponent(email)}%0A%0AMessage:%20${encodeURIComponent(message)}`;

    // mailto 링크 열기
    window.location.href = mailtoLink;

    // 상태 메시지 설정
    setStatus({
      type: 'success',
      message: 'Your data deletion request has been sent successfully.',
    });

    // 폼 초기화
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <Head>
        <title>Delete Your Data</title>
        <meta name="description" content="Request the deletion of your data." />
      </Head>
      <div className={styles.container}>
        <h1>Delete Your Data</h1>
        <p>
          Please fill out the form below to request the deletion of your data.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Honeypot 필드 - 사용자에게 숨김 */}
          <div style={{ display: 'none' }}>
            <label htmlFor="honeypot">Leave this field empty</label>
            <input
              type="text"
              id="honeypot"
              name="honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          <label htmlFor="email" className={styles.label}>
            Email Address<span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your-email@example.com"
          />

          <label htmlFor="message" className={styles.label}>
            Message (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            placeholder="Any additional information you want to provide."
          ></textarea>

          <button type="submit" className={styles.button}>
            Submit Request
          </button>
        </form>

        {status && (
          <p
            className={
              status.type === 'success' ? styles.success : styles.error
            }
          >
            {status.message}
          </p>
        )}
      </div>
    </>
  );
};

export default DeleteData;
