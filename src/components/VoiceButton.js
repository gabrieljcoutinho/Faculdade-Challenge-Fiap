import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceButton = () => {
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Reconhecido:', transcript);

      if (transcript.includes('home')) {
        navigate('/');
      } else if (transcript.includes('conexoes') || transcript.includes('conexão')) {
        navigate('/conexoes');
      } else if (transcript.includes('contato')) {
        navigate('/contato');
      } else if (transcript.includes('configurações')) {
        navigate('/configuracoes');
      } else if (transcript.includes('login') || transcript.includes('logar')) {
        navigate('/login');
      } else if (transcript.includes('cadastro')) {
        navigate('/cadastro');
      } else if (transcript.includes('chat')) {
        navigate('/chat');
      } else {
        alert('Comando não reconhecido: ' + transcript);
      }
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

  }, [navigate, recognition]);

  const handleClick = () => {
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        border: listening ? '3px solid rgba(15, 240, 252, 1)' : '3px solid transparent',
        borderRadius: '50px',
        backgroundColor: listening ? 'rgba(15, 240, 252, 0.15)' : '#007BFF',
        color: listening ? '#0ff' : '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        zIndex: 9999,
      }}
      aria-pressed={listening}
      title="Clique para falar"
    >
      {listening ? 'Ouvindo...' : '🎤 Falar'}
    </button>
  );
};

export default VoiceButton;
