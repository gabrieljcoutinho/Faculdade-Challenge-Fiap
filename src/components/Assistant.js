// src/components/Assistant.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../CSS/Bot/style.css'

const Assistant = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [active, setActive] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Inicializa a API de reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta a Web Speech API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Você disse:', transcript);

      // Se o assistente estiver ativo, processa o comando
      if (active) {
        if (transcript.includes('home') || transcript.includes('página inicial') || transcript.includes('início') || transcript.includes('inicio')) {
          navigate('/');
        } else if (transcript.includes('conexão') || transcript.includes('conexoes')) {
          navigate('/conexoes');
        } else if (transcript.includes('contato')) {
          navigate('/contato');
        } else if (transcript.includes('configuração') || transcript.includes('configurações')) {
          navigate('/configuracoes');
        } else if (transcript.includes('cadastro') || transcript.includes('logar') || transcript.includes('login')) {
          navigate('/login');
        }
      }

      // Reseta o temporizador de inatividade
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActive(false);
      }, 5000);
    };

    recognition.onend = () => {
      if (active) {
        recognition.start();
      }
    };

    return () => {
      recognition.stop();
      clearTimeout(timeoutRef.current);
    };
  }, [active, navigate]);

  const startAssistant = () => {
    if (!recognitionRef.current) return;
    setActive(true);
    recognitionRef.current.start();

    // Desativa após 5 segundos de inatividade
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActive(false);
    }, 5000);
  };

  // Ativa o assistente ao ouvir o nome "hades"
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.lang = 'pt-BR';
    wakeRecognition.interimResults = false;
    wakeRecognition.continuous = true;

    wakeRecognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Você disse (wake):', transcript);

      if (transcript.includes('hades')) {
        startAssistant();
      }
    };

    wakeRecognition.start();

    return () => {
      wakeRecognition.stop();
    };
  }, []);

  return (
    <div
      className="assistant-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: active ? '5px solid rgba(15, 240, 252)' : 'none',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    ></div>
  );
};

export default Assistant;
