import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;  // Fica ouvindo continuamente
    recognition.interimResults = true; // Resultados parciais para feedback

    recognition.onstart = () => {
      setListening(true);
      setMessage('Estou ouvindo...');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setMessage(`Você disse: "${finalTranscript}"`);
        handleCommand(finalTranscript);
      } else if (interimTranscript) {
        setMessage(`Ouvindo: "${interimTranscript}"`);
      }
    };

    recognition.onerror = (event) => {
      setMessage('Erro no reconhecimento: ' + event.error);
      setListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        recognition.stop();
      } else {
        // Tenta reiniciar em caso de erro temporário
        if (recognition) recognition.start();
      }
    };

    recognition.onend = () => {
      // Se estiver "ouvindo", reinicia automaticamente para ouvir mais comandos
      if (listening && recognition) {
        recognition.start();
      } else {
        setListening(false);
        setMessage('Clique e fale');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      setListening(false);
    };
  }, [listening]);

  function handleCommand(text) {
    const t = text.toLowerCase();

    if (
      t.includes('home') || t.includes('página inicial') || t.includes('início') ||
      t.includes('principal') || t.includes('voltar para home') || t.includes('ir para home') ||
      t.includes('vá para home') || t.includes('voltar início') || t.includes('pagina da home') ||
      t.includes('pagina home')
    ) {
      navigate('/');
      setMessage('Indo para Home');
    }
    else if (
      t.includes('conexão') || t.includes('conexoes') || t.includes('conexões') ||
      t.includes('conectar') || t.includes('minhas conexões') || t.includes('abrir conexões') ||
      t.includes('página de conexões') || t.includes('ir para conexões') ||
      t.includes('aparelho conectado') || t.includes('aparelhos conectado')
    ) {
      navigate('/conexoes');
      setMessage('Indo para Conexões');
    }
    else if (
      t.includes('contato') || t.includes('falar com') || t.includes('fale comigo') ||
      t.includes('atendimento') || t.includes('suporte') || t.includes('página de contato') ||
      t.includes('ir para contato') || t.includes('abrir contato') || t.includes('help center')
    ) {
      navigate('/contato');
      setMessage('Indo para Contato');
    }
    else if (
      t.includes('configurações') || t.includes('configuracao') || t.includes('configuraçãoo') ||
      t.includes('ajustes') || t.includes('preferências') || t.includes('configurar') ||
      t.includes('ir para configurações') || t.includes('abrir configurações') ||
      t.includes('ir para configuração') || t.includes('abrir configuração')
    ) {
      navigate('/configuracoes');
      setMessage('Indo para Configurações');
    }
    else if (
      t.includes('login') || t.includes('logar') || t.includes('entrar') ||
      t.includes('acessar conta') || t.includes('fazer login') || t.includes('página de login') ||
      t.includes('ir para login')
    ) {
      navigate('/login');
      setMessage('Indo para Login');
    }
    else if (
      t.includes('cadastro') || t.includes('cadastrar') || t.includes('registrar') ||
      t.includes('criar conta') || t.includes('abrir cadastro') || t.includes('fazer cadastro') ||
      t.includes('página de cadastro') || t.includes('ir para cadastro')
    ) {
      navigate('/cadastro');
      setMessage('Indo para Cadastro');
    }
    else if (
      t.includes('chat') || t.includes('conversar') || t.includes('mensagem') ||
      t.includes('bate-papo') || t.includes('abrir chat') || t.includes('ir para chat') ||
      t.includes('ir para o chat') || t.includes('página de chat')
    ) {
      navigate('/chat');
      setMessage('Indo para Chat');
    }
    else {
      setMessage('Comando não reconhecido. Tente novamente.');
    }
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setMessage('Parado');
    } else {
      recognitionRef.current.start();
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: listening ? '#0056b3' : '#007bff',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
        cursor: 'pointer',
        userSelect: 'none',
        width: 180,
        textAlign: 'center',
        zIndex: 1000000000,
      }}
      onClick={toggleListening}
      title="Clique para ativar/desativar a escuta"
    >
      {listening ? 'Ouvindo...' : 'Clique e fale'}
      <div style={{ fontSize: 12, marginTop: 5, minHeight: 18 }}>{message}</div>
    </div>
  );
};

export default VoiceAssistant;
