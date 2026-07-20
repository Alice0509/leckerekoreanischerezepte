import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function SiteMusicPlayer() {
  const audioRef = useRef(null);
  const router = useRouter();
  const { locale } = router;

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isGerman = locale === 'de';

  const label = isGerman
    ? isPlaying
      ? 'Küchenmusik pausieren'
      : 'Küchenmusik abspielen'
    : isPlaying
      ? 'Pause kitchen music'
      : 'Play kitchen music';

  const buttonText = isGerman
    ? isPlaying
      ? 'Pause'
      : 'Musik'
    : isPlaying
      ? 'Pause'
      : 'Music';

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    setHasInteracted(true);

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = 0.35;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <div className="musicPlayer" aria-live="polite">
      <audio
        ref={audioRef}
        src="/audio/hansik-young-theme.mp3"
        loop
        preload={hasInteracted ? 'auto' : 'none'}
      />

      <button
        type="button"
        className={isPlaying ? 'playing' : ''}
        onClick={toggleMusic}
        aria-label={label}
        title={label}
      >
        <span className="musicIcon" aria-hidden="true">
          {isPlaying ? 'Ⅱ' : '♪'}
        </span>
        <span className="musicText">{buttonText}</span>
      </button>

      <style jsx>{`
        .musicPlayer {
          position: fixed;
          left: 16px;
          bottom: 16px;
          z-index: 1000;
        }

        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(120, 90, 60, 0.25);
          border-radius: 999px;
          background: rgba(255, 250, 244, 0.94);
          color: #4b3324;
          padding: 9px 14px;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(8px);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .musicIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 14px;
          font-weight: 800;
        }

        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
          background: rgba(255, 247, 235, 0.98);
        }

        button.playing {
          background: rgba(246, 232, 211, 0.98);
        }

        @media (max-width: 640px) {
          .musicPlayer {
            right: 20px;
            bottom: calc(82px + env(safe-area-inset-bottom, 0px));
            left: auto;
          }

          button {
            width: 46px;
            height: 46px;
            padding: 0;
            font-size: 18px;
          }

          .musicText {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
