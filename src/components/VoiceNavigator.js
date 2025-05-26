import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Voice/style.css';

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

          if (commandTimeout) clearTimeout(commandTimeout);
          commandTimeout = setTimeout(() => {
            setListening(false);
          }, 10000);

          console.log('Modo comando ativado!');
        }
      } else {
        // Modo comando ativo: reconhecer comandos de navegação
        let navegou = false;

        if (transcript.includes('home')) {
          navigate('/');
          navegou = true;
        } else if (transcript.includes('conexões') || transcript.includes('conexoes')) {
          navigate('/conexoes');
          navegou = true;
        } else if (transcript.includes('contato')) {
          navigate('/contato');
          navegou = true;
        } else if (transcript.includes('configurações') || transcript.includes('configuracoes')) {
          navigate('/configuracoes');
          navegou = true;
        } else if (transcript.includes('login')) {
          navigate('/login');
          navegou = true;
        } else if (transcript.includes('cadastro')) {
          navigate('/cadastro');
          navegou = true;
        } else if (transcript.includes('chat')) {
          navigate('/chat');
          navegou = true;
        }

        if (navegou) {
          // Comando reconhecido e navegação executada
          setListening(false);  // Remove o fundo imediatamente

          if (commandTimeout) clearTimeout(commandTimeout);
          commandTimeout = null;

          return; // sai para não resetar o timeout abaixo
        }

        // Se não navegou, mantém o timeout para continuar ouvindo
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

  // Renderiza a borda apenas quando o modo comando está ativo
  return listening ? <div id="voice-border" /> : null;
};

export default VoiceNavigator;
