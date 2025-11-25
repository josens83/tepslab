import { useEffect, useState } from 'react';
import { IoClose, IoCloudDownloadOutline } from 'react-icons/io5';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has previously dismissed the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    const dismissedDate = new Date().getTime();
    localStorage.setItem('pwa-install-dismissed', dismissedDate.toString());

    // Clear dismissal after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="닫기"
      >
        <IoClose size={24} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-brand-cyan/10 p-3 rounded-lg">
          <IoCloudDownloadOutline className="text-brand-cyan" size={32} />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">
            TEPS Lab 앱 설치
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            홈 화면에 추가하여 더 빠르고 편리하게 학습하세요!
          </p>

          <div className="flex gap-2">
            <Button
              variant="cyan"
              size="sm"
              onClick={handleInstallClick}
              className="flex-1"
            >
              설치하기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              나중에
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
