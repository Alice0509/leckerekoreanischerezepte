// components/Timer.js
import React, { useEffect, useState } from 'react';

const Timer = ({ duration }) => {
  // duration은 초 단위
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0 && !hasAlerted) {
      // 타이머가 0에 도달하면 알림 실행 (한 번만 실행)
      setHasAlerted(true);
      alert('타이머가 완료되었습니다!');
    }
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, hasAlerted]);

  const startTimer = () => {
    setIsRunning(true);
    setHasAlerted(false); // 재시작 시 알림 초기화
  };
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setHasAlerted(false);
  };

  // 초 단위를 분:초 형식으로 변환
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      onClick={(e) => e.stopPropagation()} // 상위 요소 클릭 영향 차단
    >
      <span>{formatTime(timeLeft)}</span>
      {!isRunning && timeLeft === duration && (
        <button onClick={startTimer}>Start</button>
      )}
      {isRunning && <button onClick={pauseTimer}>Pause</button>}
      {!isRunning && timeLeft < duration && timeLeft > 0 && (
        <button onClick={startTimer}>Resume</button>
      )}
      {(!isRunning && timeLeft > 0 && timeLeft < duration) || timeLeft === 0 ? (
        <button onClick={resetTimer}>Reset</button>
      ) : null}
      {!isRunning && timeLeft === 0 && (
        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Done!</span>
      )}
    </div>
  );
};

export default Timer;
