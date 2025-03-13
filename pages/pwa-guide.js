import { useRouter } from 'next/router';

export default function PWAGuide() {
  const { locale } = useRouter(); // 현재 언어 감지

  // 언어별 번역 데이터
  const translations = {
    en: {
      title: '📱 Install Our App-like Website!',
      description:
        'Enjoy fast access and offline support by installing our PWA.',
      androidTitle: '🔹 How to Install on Android',
      androidSteps: [
        '1️⃣ Open this page in Chrome.',
        '2️⃣ Tap the menu button (⋮) at the top-right.',
        '3️⃣ Select "Add to Home screen" and confirm.',
      ],
      iosTitle: '🔹 How to Install on iPhone & iPad',
      iosSteps: [
        '1️⃣ Open this page in Safari.',
        '2️⃣ Tap the share button (⬆️) at the bottom.',
        '3️⃣ Select "Add to Home screen" and confirm.',
      ],
      installButton: 'Install App',
    },
    de: {
      title: '📱 Installiere unsere App-ähnliche Website!',
      description:
        'Erlebe schnellen Zugriff und Offline-Unterstützung mit unserer PWA.',
      androidTitle: '🔹 So installierst du die App auf Android',
      androidSteps: [
        '1️⃣ Öffne diese Seite in Chrome.',
        '2️⃣ Tippe auf das Menü-Symbol (⋮) oben rechts.',
        '3️⃣ Wähle "Zum Startbildschirm hinzufügen" und bestätige.',
      ],
      iosTitle: '🔹 So installierst du die App auf iPhone & iPad',
      iosSteps: [
        '1️⃣ Öffne diese Seite in Safari.',
        '2️⃣ Tippe auf das Teilen-Symbol (⬆️) unten.',
        '3️⃣ Wähle "Zum Home-Bildschirm hinzufügen" und bestätige.',
      ],
      installButton: 'App installieren',
    },
  };

  // 현재 언어에 맞는 번역 선택
  const t = translations[locale] || translations.en;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{t.title}</h1>
      <p>{t.description}</p>

      <h2>{t.androidTitle}</h2>
      {t.androidSteps.map((step, index) => (
        <p key={index}>{step}</p>
      ))}

      <h2>{t.iosTitle}</h2>
      {t.iosSteps.map((step, index) => (
        <p key={index}>{step}</p>
      ))}

      <button
        id="install-button"
        style={{
          display: 'none',
          padding: '10px',
          backgroundColor: '#ff6600',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {t.installButton}
      </button>

      {/* PWA 설치 스크립트 */}
      <script>
        {`
          if ('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches === false) {
            window.addEventListener('beforeinstallprompt', (event) => {
              event.preventDefault();
              let installPrompt = event;
              document.getElementById('install-button').style.display = 'block';

              document.getElementById('install-button').addEventListener('click', () => {
                installPrompt.prompt();
                installPrompt.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('PWA installiert');
                  } else {
                    console.log('PWA-Installation abgelehnt');
                  }
                  installPrompt = null;
                });
              });
            });
          }
        `}
      </script>
    </div>
  );
}
