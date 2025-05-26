import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Voice/style.css'

const VoiceNavigator = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;

    let commandTimeout = null;

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();

      console.log('Reconhecido:', transcript);

      if (!listening) {
        // Modo standby: ativar só se disser "sexta-feira"
        if (transcript.includes('sexta-feira')) {
          setListening(true);
          // Modo comando ativo por 10 segundos
          if (commandTimeout) clearTimeout(commandTimeout);
          commandTimeout = setTimeout(() => {
            setListening(false);
          }, 10000);
          console.log('Modo comando ativado!');
        }
      } else {
        // Modo comando ativo: reconhecer comandos de navegação
        if (transcript.includes('home')) {
          navigate('/');
        } else if (transcript.includes('conexões') || transcript.includes('conexoes')) {
          navigate('/conexoes');
        } else if (transcript.includes('contato')) {
          navigate('/contato');
        } else if (transcript.includes('configurações') || transcript.includes('configuracoes')) {
          navigate('/configuracoes');
        } else if (transcript.includes('login')) {
          navigate('/login');
        } else if (transcript.includes('cadastro')) {
          navigate('/cadastro');
        } else if (transcript.includes('chat')) {
          navigate('/chat');
        }

        // Reinicia o timeout para manter o modo comando ativo mais 10 segundos a partir do último comando
        if (commandTimeout) clearTimeout(commandTimeout);
        commandTimeout = setTimeout(() => {
          setListening(false);
          console.log('Modo comando desativado por timeout');
        }, 10000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
    };

    recognition.onend = () => {
      // Recomeça o reconhecimento sempre, para não parar de escutar
      recognition.start();
    };

    recognition.start();

    return () => {
      if (commandTimeout) clearTimeout(commandTimeout);
      recognition.stop();
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [listening, navigate]);

  // Render vazio, mas vamos expor o estado listening para controlar a borda
  return listening ? <div id="voice-border" /> : null;
};

export default VoiceNavigator;
