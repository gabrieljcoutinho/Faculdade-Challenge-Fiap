// InstallButtonMobile.js
import { useState, useEffect } from 'react';

function InstallButtonMobile() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  // Função para detectar se é celular
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    if (!isMobile()) return; // Se não for mobile, não faz nada

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true); // mostra o botão apenas em mobile
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou instalar o app!');
      }
      setDeferredPrompt(null);
      setShowButton(false);
    });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: '#252525',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        zIndex: 1000,
      }}
    >
      Instalar App
    </button>
  );
}

export default InstallButtonMobile;
