// src/hooks/useVoiceCommands.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useVoiceCommands = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Reconhecimento de voz não suportado!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim().toLowerCase();
      console.log('Você disse:', transcript);

      // Navegação por comandos
      if (transcript.includes('home')) {
        navigate('/');
      } else if (transcript.includes('conexões') || transcript.includes('conexao')) {
        navigate('/conexoes');
      } else if (transcript.includes('contato')) {
        navigate('/contato');
      } else if (transcript.includes('configurações')) {
        navigate('/configuracoes');
      } else if (transcript.includes('login') || transcript.includes('logar')) {
        navigate('/login');
      } else if (transcript.includes('criar conta') || transcript.includes('cadastro')) {
        navigate('/cadastro');
      } else if (transcript.includes('chat')) {
        navigate('/chat');
      }

      // Efeito de "luz azul" ao falar "umbra"
      if (transcript.includes('umbra')) {
        document.body.style.boxShadow = '0 0 40px 10px rgba(15, 240, 252, 0.7)';
        document.body.style.transition = 'box-shadow 0.3s ease-in-out';
        setTimeout(() => {
          document.body.style.boxShadow = 'none';
        }, 3000); // luz por 3 segundos
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [navigate]);
};

export default useVoiceCommands;
