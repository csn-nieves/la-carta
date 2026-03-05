import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'install-banner-dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

function isIosSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

const shouldShow = !isStandalone() && !localStorage.getItem(DISMISS_KEY);

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos] = useState(() => shouldShow && isIosSafari());
  const [dismissed, setDismissed] = useState(!shouldShow);

  useEffect(() => {
    if (!shouldShow || showIos) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [showIos]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (dismissed || (!deferredPrompt && !showIos)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Install La Carta</p>
          {showIos ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Tap the share button
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1 -mt-0.5 text-blue-500">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              then "Add to Home Screen"
            </p>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Add to your home screen for quick access</p>
          )}
        </div>
        {!showIos && (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 border-none cursor-pointer shrink-0"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer text-lg leading-none shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
