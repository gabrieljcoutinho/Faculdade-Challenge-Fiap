// AssistenteVirtual.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../CSS/Bot/index.css'


const AssistenteVirtual = () => {
  const [resposta, setResposta] = useState('');
  const navigate = useNavigate();

  const comandos = (mensagem) => {
    const texto = mensagem.toLowerCase();

    if (texto.includes('configurações')) {
      speak("Abrindo configurações");
      navigate('/configuracoes');
    } else if (texto.includes('conexões')) {
      speak("Indo para conexões");
      navigate('/conexoes');
    } else if (texto.includes('home') || texto.includes('início')) {
      speak("Voltando para a página inicial");
      navigate('/');
    } else if (texto.includes('ligar ar')) {
      speak("Ligando ar-condicionado virtual");
      // Aqui você acionaria alguma lógica do app
    } else {
      speak("Desculpe, não entendi. Tente novamente.");
    }
  };

  const speak = (texto) => {
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  };

  const startRecognition = () => {
    const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResposta(transcript);
      comandos(transcript);
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
