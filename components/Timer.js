// components/Timer.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Timer = ({ duration }) => {
  const router = useRouter();
  const isGerman = router.locale === 'de';

  const totalSeconds = Math.max(Number(duration) || 0, 0);

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  const labels = {
    start: isGerman ? 'Starten' : 'Start',
    pause: isGerman ? 'Pause' : 'Pause',
    resume: isGerman ? 'Weiter' : 'Resume',
    reset: isGerman ? 'Zurücksetzen' : 'Reset',
    done: isGerman ? 'Fertig' : 'Done',
    alert: isGerman ? 'Der Timer ist fertig.' : 'The timer is done.',
    aria: isGerman ? 'Küchentimer' : 'Kitchen timer',
  };

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setHasAlerted(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return undefined;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft === 0 && !hasAlerted) {
      setIsRunning(false);
      setHasAlerted(true);
      window.alert(labels.alert);
    }
  }, [isRunning, timeLeft, hasAlerted, labels.alert]);

  if (!totalSeconds) return null;

  const startTimer = () => {
    setIsRunning(true);
    setHasAlerted(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setHasAlerted(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer" aria-label={labels.aria} aria-live="polite">
      <span className={isRunning ? 'time running' : 'time'}>
        {formatTime(timeLeft)}
      </span>

      {!isRunning && timeLeft === totalSeconds && (
        <button
          type="button"
          className="timerButton primary"
          onClick={startTimer}
        >
          {labels.start}
        </button>
      )}

      {isRunning && (
        <button type="button" className="timerButton" onClick={pauseTimer}>
          {labels.pause}
        </button>
      )}

      {!isRunning && timeLeft < totalSeconds && timeLeft > 0 && (
        <button
          type="button"
          className="timerButton primary"
          onClick={startTimer}
        >
          {labels.resume}
        </button>
      )}

      {!isRunning && timeLeft < totalSeconds && (
        <button
          type="button"
          className="timerButton subtle"
          onClick={resetTimer}
        >
          {labels.reset}
        </button>
      )}

      {!isRunning && timeLeft === 0 && (
        <span className="doneBadge">✓ {labels.done}</span>
      )}

      <style jsx>{`
        .timer {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 0.92rem;
          line-height: 1;
        }

        .time {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 46px;
          padding: 5px 8px;
          border-radius: 999px;
          background: #fff7eb;
          border: 1px solid rgba(133, 94, 54, 0.22);
          color: #6b4423;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .time.running {
          background: #edf6e8;
          color: #426b2f;
        }

        .timerButton {
          appearance: none;
          border: 1px solid rgba(133, 94, 54, 0.25);
          border-radius: 999px;
          background: #fffaf4;
          color: #4b3324;
          padding: 5px 9px;
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }

        .timerButton:hover {
          transform: translateY(-1px);
          background: #fff3df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .timerButton.primary {
          background: #8dbb78;
          border-color: #8dbb78;
          color: #ffffff;
        }

        .timerButton.primary:hover {
          background: #7eaa6c;
        }

        .timerButton.subtle {
          color: #7a6758;
        }

        .doneBadge {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf6e8;
          color: #426b2f;
          font-size: 0.82rem;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .timer {
            gap: 5px;
            font-size: 0.86rem;
          }

          .time {
            min-width: 42px;
            padding: 5px 7px;
          }

          .timerButton,
          .doneBadge {
            padding: 5px 8px;
            font-size: 0.78rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Timer;
