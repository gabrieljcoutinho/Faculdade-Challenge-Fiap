import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import microFone from '../imgs/microgone.png';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  function handleCommand(text) {
    const t = text.toLowerCase();
    // ... (mantém sua lógica de comandos aqui)
    if (
      t.includes('home') || t.includes('página inicial') || t.includes('início') ||
      t.includes('principal') || t.includes('voltar para home') || t.includes('ir para home') ||
      t.includes('vá para home') || t.includes('voltar início') || t.includes('pagina da home') || t.includes('pagina home')
    ) {
      navigate('/');
      setMessage('Indo para Home');
    } else if (
      t.includes('conexão') || t.includes('conexoes') || t.includes('conexões') || t.includes('conectar') ||
      t.includes('minhas conexões') || t.includes('abrir conexões') || t.includes('página de conexões') ||
      t.includes('ir para conexões') || t.includes('aparelho conectado') || t.includes('aparelhos conectados')
    ) {
      navigate('/conexoes');
      setMessage('Indo para Conexões');
    }
    // ... continue com os outros comandos
    else {
      setMessage('Comando não reconhecido. Tente novamente.');
    }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage('Estou ouvindo...');
    };

    recognition.onend = () => {
      setListening(false);
      setMessage('Clique no microfone');
    };

    recognition.onerror = (event) => {
      setMessage('Erro no reconhecimento: ' + event.error);
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setMessage(`Você disse: "${transcript}"`);
      handleCommand(transcript);
    };

    recognition.start();
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 801,
        right: 10,
        backgroundColor: '#007bff',
        padding: 1,
        borderRadius: 50,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 1000000000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 50
      }}
      onClick={startListening}
    >
      <img
        src={microFone} // ou use microfoneIcon se importado
        alt="Microfone"
        style={{
          width: 35,
          height: 35,
          filter: listening ? 'grayscale(0%)' : 'grayscale(100%)',
        }}
      />
      <div style={{ fontSize: 12, color: '#fff', marginTop: 5 }}>{message}</div>
    </div>
  );
};

export default VoiceAssistant;
