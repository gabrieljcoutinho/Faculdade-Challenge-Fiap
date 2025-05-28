// src/components/VoiceCommands.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function VoiceCommands() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o navegador suporta reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Reconhecimento de voz não suportado!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true; // Para ouvir continuamente
    recognition.interimResults = false; // Não precisa de resultados intermediários

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Você disse:', transcript);

      // Se a palavra for "umbra", ativa o efeito visual
      if (transcript.includes('umbra')) {
        ativarEfeitoLuminoso();
      }

      // Comandos de navegação
      if (transcript.includes('home')) {
        navigate('/');
      } else if (transcript.includes('conexões')) {
        navigate('/conexoes');
      } else if (transcript.includes('contato')) {
        navigate('/contato');
      } else if (transcript.includes('chat')) {
        navigate('/chat');
      } else if (transcript.includes('configurações')) {
        navigate('/configuracoes');
      } else if (transcript.includes('logar') || transcript.includes('login')) {
        navigate('/login');
      } else if (transcript.includes('criar conta')) {
        navigate('/cadastro');
      }
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento:', event.error);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [navigate]);

  // Função para ativar o efeito luminoso na página
  const ativarEfeitoLuminoso = () => {
    const body = document.body;
    const originalBg = body.style.backgroundColor;

    // Muda a cor por um tempo
    body.style.backgroundColor = 'rgba(15, 240, 252);';
    setTimeout(() => {
      body.style.backgroundColor = originalBg;
    }, 1000); // 1 segundo
  };

  return null; // Esse componente não renderiza nada visível
}

export default VoiceCommands;
