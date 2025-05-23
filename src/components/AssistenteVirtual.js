// AssistenteVirtual.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../CSS/Bot/index.css';

const AssistenteVirtual = () => {
  const [resposta, setResposta] = useState('');
  const navigate = useNavigate();

  const comandos = (mensagem) => {
    const texto = mensagem.toLowerCase();

    if (texto.includes('configurações')) {
      speak('Abrindo configurações');
      navigate('/configuracoes');
    } else if (texto.includes('conexões')) {
      speak('Indo para conexões');
      navigate('/conexoes');
    } else if (texto.includes('home') || texto.includes('início')) {
      speak('Voltando para a página inicial');
      navigate('/');
    } else if (texto.includes('ligar ar')) {
      speak('Ligando ar-condicionado virtual');
      // Aqui você pode acionar alguma lógica do app
    } else {
      speak('Desculpe, não entendi. Tente novamente.');
    }
  };

  const speak = (texto) => {
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResposta(transcript);
      comandos(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento:', event.error);
      speak('Desculpe, não consegui ouvir direito. Por favor, tente novamente.');
    };

    recognition.onend = () => {
      console.log('Reconhecimento finalizado');
    };
  };

  return (
    <div className="assistente-container">
      <button onClick={startRecognition}>🎤 Falar</button>
      <p><strong>Você disse:</strong> {resposta}</p>
    </div>
  );
};

export default AssistenteVirtual;
