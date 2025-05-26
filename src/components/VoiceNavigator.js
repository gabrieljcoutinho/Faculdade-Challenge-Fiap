// src/components/VoiceNavigator.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceNavigator = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();

      console.log('Ouviu:', transcript);

      if (!listening) {
        if (transcript === 'hades') {
          setListening(true);
          console.log('Ativando modo comando...');
        }
      } else {
        // Aqui mapeia os comandos para rotas
        const comandosParaRotas = {
          home: '/',
          conexoes: '/conexoes',
          contato: '/contato',
          configuracoes: '/configuracoes',
          login: '/login',
          cadastro: '/cadastro',
          chat: '/chat',
        };

        if (transcript in comandosParaRotas) {
          navigate(comandosParaRotas[transcript]);
          console.log(`Navegando para ${comandosParaRotas[transcript]}`);
        } else {
          alert('Comando não reconhecido, tente novamente.');
        }
        setListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      // Se não estiver ouvindo comando, reinicia para ficar sempre ouvindo "hades"
      if (!listening) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Cleanup
    return () => {
      recognition.stop();
    };
  }, [listening, navigate]);

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        border: listening ? '5px solid rgba(15, 240, 252, 0.8)' : 'none',
        borderRadius: '15px',
        transition: 'border 0.3s ease',
        zIndex: 9999,
      }}
    />
  );
};

export default VoiceNavigator;
