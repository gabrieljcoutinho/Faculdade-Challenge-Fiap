import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  // Verifica suporte
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    recognition.continuous = false; // só uma frase
    recognition.lang = 'pt-BR'; // idioma português BR
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage('Estou ouvindo...');
    };

    recognition.onend = () => {
      setListening(false);
      setMessage('Diga algo para navegar...');
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
  }, []);

  // Função para reconhecer comandos
  function handleCommand(text) {
    // Navega conforme comandos mais comuns
    if (text.includes('home')) {
      navigate('/');
      setMessage('Indo para Home');
    } else if (text.includes('conexão') || text.includes('conexoes') || text.includes('conexões')) {
      navigate('/conexoes');
      setMessage('Indo para Conexões');
    } else if (text.includes('contato')) {
      navigate('/contato');
      setMessage('Indo para Contato');
    } else if (text.includes('configurações') || text.includes('configuracao')) {
      navigate('/configuracoes');
      setMessage('Indo para Configurações');
    } else if (text.includes('login') || text.includes('logar')) {
      navigate('/login');
      setMessage('Indo para Login');
    } else if (text.includes('cadastro')) {
      navigate('/cadastro');
      setMessage('Indo para Cadastro');
    } else if (text.includes('chat')) {
      navigate('/chat');
      setMessage('Indo para Chat');
    } else {
      setMessage('Comando não reconhecido. Tente novamente.');
    }
  }

  // Iniciar escuta
  function startListening() {
    if (!recognition) return;
    recognition.start();
  }

  return (
    <div style={{position: 'fixed', bottom: 20, right: 20, backgroundColor: '#007bff', color: '#fff', padding: 10, borderRadius: 8, cursor: 'pointer', userSelect: 'none'}}>
      <div onClick={startListening}>
        {listening ? 'Ouvindo...' : 'Clique e fale'}
      </div>
      <div style={{fontSize: 12, marginTop: 5}}>{message}</div>
    </div>
  );
};

export default VoiceAssistant;
