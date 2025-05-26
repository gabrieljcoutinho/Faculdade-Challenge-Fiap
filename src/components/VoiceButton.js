import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceButton = () => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }
    // cria uma única instância e guarda no ref
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'pt-BR';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setListening(true);
    };

    recognitionRef.current.onresult = (event) => {
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
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      // encerra o estado listening
      setListening(false);
    };

    return () => {
      // cleanup: para o reconhecimento se o componente desmontar
      recognitionRef.current?.stop();
      setListening(false);
    };
  }, [navigate]);

  const handleClick = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // erro caso tente start duas vezes rapidamente
        console.log('Erro ao iniciar reconhecimento:', e);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '14px 28px',
        border: listening ? '3px solid rgba(15, 240, 252, 1)' : '3px solid transparent',
        borderRadius: '50px',
        backgroundColor: listening ? 'rgba(15, 240, 252, 0.15)' : '#007BFF',
        color: listening ? 'rgba(15, 240, 252, 1)' : '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        zIndex: 9999,
      }}
      aria-pressed={listening}
      title="Clique e fale"
    >
      {listening ? 'Ouvindo...' : '🎤 Falar'}
    </button>
  );
};

export default VoiceButton;
