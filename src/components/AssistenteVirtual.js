// AssistenteVirtual.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../CSS/Bot/index.css';

const AssistenteVirtual = () => {
  const [resposta, setResposta] = useState('');
  const navigate = useNavigate();

  const speak = (texto) => {
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  };

  const comandos = (mensagem) => {
    const texto = mensagem.toLowerCase();

    if (texto.includes('configurações') || texto.includes('configuração')) {
      speak("Abrindo configurações");
      navigate('/configuracoes');

    } else if (texto.includes('conexões') || texto.includes('conexao')) {
      speak("Indo para conexões");
      navigate('/conexoes');

    } else if (texto.includes('home') || texto.includes('início') || texto.includes('inicial')) {
      speak("Voltando para a página inicial");
      navigate('/');

    } else if (
      texto.includes('ligar ar') ||
      texto.includes('ligue o ar') ||
      texto.includes('ar condicionado') ||
      texto.includes('ar-condicionado')
    ) {
      speak("Ligando ar-condicionado virtual");
      // Lógica para ligar o ar-condicionado

    } else {
      speak("Desculpe, não entendi. Tente novamente.");
    }
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Texto reconhecido:", transcript); // Para debug
      setResposta(transcript);
      comandos(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento:", event.error);
      speak("Ocorreu um erro no reconhecimento de voz.");
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
