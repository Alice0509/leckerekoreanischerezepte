import { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../styles/ToTopButton.module.css';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

const ToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutId = useRef(null);

  const toggleVisibility = useCallback(() => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, 100); // 100ms 딜레이
  }, []); // 빈 배열로, 의존성 없이 처음에만 생성되도록 함

  // 버튼 클릭 시 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // 부드러운 스크롤
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      clearTimeout(timeoutId.current); // 타임아웃도 해제합니다.
    };
  }, [toggleVisibility]);

  return (
    <>
      {isVisible && (
        <button
          className={styles.toTopButton}
          onClick={scrollToTop}
          aria-label="Scroll to top" // 접근성 향상을 위한 aria-label 추가
        >
          <ChevronUpIcon className={styles.icon} />
        </button>
      )}
    </>
  );
};

export default ToTopButton;
