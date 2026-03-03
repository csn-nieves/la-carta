import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Install La Carta</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Add to your home screen for quick access</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 border-none cursor-pointer"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 bg-transparent border-none cursor-pointer text-lg leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
