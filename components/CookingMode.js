import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Timer from './Timer';
import styles from '../styles/CookingMode.module.css';

const HEAT_LABELS = {
  en: {
    low: 'Low heat',
    'medium-low': 'Medium-low heat',
    medium: 'Medium heat',
    'medium-high': 'Medium-high heat',
    high: 'High heat',
  },
  de: {
    low: 'Niedrige Hitze',
    'medium-low': 'Niedrige bis mittlere Hitze',
    medium: 'Mittlere Hitze',
    'medium-high': 'Mittlere bis hohe Hitze',
    high: 'Hohe Hitze',
  },
};

const CookingMode = ({
  isOpen,
  onClose,
  title,
  steps = [],
  checkedSteps = [],
  onCompleteStep,
  onFinish,
  locale = 'en',
  renderContent,
}) => {
  const isGerman = locale === 'de';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef(null);
  const stepCardRef = useRef(null);
  const wasOpenRef = useRef(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const usableSteps = useMemo(
    () =>
      steps
        .map((step, sourceIndex) => ({ ...step, sourceIndex }))
        .filter((step) => step?.description)
        .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0)),
    [steps]
  );

  useEffect(() => {
    const isOpening = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!isOpening || usableSteps.length === 0) return;

    const firstUnchecked = usableSteps.findIndex(
      (step) => !checkedSteps[step.sourceIndex]
    );

    setCurrentIndex(firstUnchecked >= 0 ? firstUnchecked : 0);
  }, [isOpen, usableSteps, checkedSteps]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((index) => Math.min(index + 1, usableSteps.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, usableSteps.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return;

      try {
        const lock = await navigator.wakeLock.request('screen');

        if (cancelled) {
          await lock.release().catch(() => {});
          return;
        }

        wakeLockRef.current = lock;
        setWakeLockActive(true);

        lock.addEventListener('release', () => {
          if (wakeLockRef.current === lock) {
            wakeLockRef.current = null;
          }
          if (!cancelled) setWakeLockActive(false);
        });
      } catch {
        if (!cancelled) setWakeLockActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    stepCardRef.current?.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, [currentIndex, isOpen]);

  if (!isOpen || usableSteps.length === 0) return null;

  const currentStep = usableSteps[currentIndex];
  const sourceIndex = currentStep.sourceIndex;
  const isChecked = Boolean(checkedSteps[sourceIndex]);
  const isLastStep = currentIndex === usableSteps.length - 1;

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const goNext = () => {
    setCurrentIndex((index) => Math.min(index + 1, usableSteps.length - 1));
  };

  const completeCurrentStep = () => {
    if (isLastStep) {
      onFinish?.();
      onClose();
      return;
    }

    if (!isChecked) {
      onCompleteStep?.(sourceIndex);
    }

    goNext();
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX > 0) {
      goPrevious();
    } else {
      goNext();
    }
  };

  const heatLabel =
    HEAT_LABELS[isGerman ? 'de' : 'en'][currentStep.heatLevel] || null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={isGerman ? `${title} Kochmodus` : `${title} cooking mode`}
    >
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.modeLabel}>
              {isGerman ? 'Kochmodus' : 'Cooking mode'}
            </span>
            <strong className={styles.title}>{title}</strong>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={isGerman ? 'Kochmodus schließen' : 'Close cooking mode'}
          >
            ×
          </button>
        </header>

        <div className={styles.progressRow}>
          <span>
            {isGerman ? 'Schritt' : 'Step'} {currentIndex + 1}{' '}
            {isGerman ? 'von' : 'of'} {usableSteps.length}
          </span>

          {wakeLockActive && (
            <span className={styles.awakeBadge}>
              {isGerman ? 'Bildschirm bleibt an' : 'Screen stays awake'}
            </span>
          )}
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={styles.progressBar}
            style={{
              width: `${((currentIndex + 1) / usableSteps.length) * 100}%`,
            }}
          />
        </div>

        <main
          ref={stepCardRef}
          className={styles.stepCard}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.stepTop}>
            <span className={styles.stepNumber}>
              {currentStep.stepNumber ?? currentIndex + 1}
            </span>

            {isChecked && (
              <span className={styles.doneBadge}>
                ✓ {isGerman ? 'Erledigt' : 'Done'}
              </span>
            )}
          </div>

          {currentStep.ingredientsUsed?.length > 0 && (
            <section className={styles.metaSection}>
              <h3>{isGerman ? 'Für diesen Schritt' : 'Used in this step'}</h3>
              <ul className={styles.ingredientList}>
                {currentStep.ingredientsUsed.map((ingredient) => (
                  <li key={ingredient.id}>{ingredient.name}</li>
                ))}
              </ul>
            </section>
          )}

          <div className={styles.stepDescription}>
            {renderContent
              ? renderContent(currentStep.description)
              : currentStep.description}
          </div>

          {(heatLabel || currentStep.timerDuration) && (
            <div className={styles.cookingMeta}>
              {heatLabel && (
                <span className={styles.heatBadge}>🔥 {heatLabel}</span>
              )}

              {currentStep.timerDuration && (
                <Timer duration={currentStep.timerDuration} />
              )}
            </div>
          )}

          {currentStep.doneWhen && (
            <aside className={styles.doneWhen}>
              <strong>{isGerman ? 'Fertig, wenn' : 'Done when'}</strong>
              <p>{currentStep.doneWhen}</p>
            </aside>
          )}

          {currentStep.image && (
            <div className={styles.stepImage}>
              <Image
                src={currentStep.image}
                alt={
                  isGerman
                    ? `Bild zu Schritt ${currentStep.stepNumber}`
                    : `Step ${currentStep.stepNumber} image`
                }
                width={600}
                height={400}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}

          <p className={styles.swipeHint}>
            {isGerman
              ? 'Nach links oder rechts wischen'
              : 'Swipe left or right'}
          </p>
        </main>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={goPrevious}
            disabled={currentIndex === 0}
          >
            ← {isGerman ? 'Zurück' : 'Previous'}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={completeCurrentStep}
          >
            {isLastStep
              ? isGerman
                ? 'Fertig ✓'
                : 'Finish ✓'
              : isGerman
                ? 'Erledigt & weiter ✓'
                : 'Done & next ✓'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CookingMode;
