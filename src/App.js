import React, { useEffect, useState } from 'react';
import './CSS/Reset.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar';
import Cadastro from './routes/pages/Cadastro';
import Chat from './routes/pages/Chat';

function VoiceCommandHandler() {
  const navigate = useNavigate();
  const [listeningForKeyword, setListeningForKeyword] = useState(true);
  const [message, setMessage] = useState('Diga "Ezekiel" para ativar o comando de voz');

  useEffect(() => {
    // Verifica se SpeechRecognition existe no navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = true;

    // Função para começar a ouvir
    const startListening = () => {
      recognition.start();
      setMessage(listeningForKeyword ? 'Diga "Ezekiel" para ativar' : 'Diga o comando de navegação');
    };

    // Quando reconhecimento captura algo
    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();

      console.log('Reconhecido:', transcript);

      if (listeningForKeyword) {
        // Procura a palavra-chave
        if (transcript.includes('ezekiel')) {
          setMessage('Comando ativado! Diga para qual página deseja navegar...');
          setListeningForKeyword(false);
        }
      } else {
        // Está ouvindo o comando depois da palavra-chave
        // Mapear comandos para rotas
        if (transcript.includes('home')) {
          navigate('/');
          setMessage('Indo para Home');
        } else if (transcript.includes('conexão') || transcript.includes('conexoes') || transcript.includes('conexões')) {
          navigate('/conexoes');
          setMessage('Indo para Conexões');
        } else if (transcript.includes('contato')) {
          navigate('/contato');
          setMessage('Indo para Contato');
        } else if (transcript.includes('configurações') || transcript.includes('configuracoes')) {
          navigate('/configuracoes');
          setMessage('Indo para Configurações');
        } else if (transcript.includes('login') || transcript.includes('logar')) {
          navigate('/login');
          setMessage('Indo para Login');
        } else if (transcript.includes('cadastro')) {
          navigate('/cadastro');
          setMessage('Indo para Cadastro');
        } else if (transcript.includes('chat')) {
          navigate('/chat');
          setMessage('Indo para Chat');
        } else {
          setMessage('Comando não reconhecido, diga novamente ou fale "cancelar" para sair');
        }

        // Volta para escutar a palavra-chave, a menos que usuário diga "cancelar"
        if (transcript.includes('cancelar')) {
          setMessage('Comando cancelado. Diga "Ezekiel" para ativar o comando de voz.');
          setListeningForKeyword(true);
        } else {
          // Após um comando válido, volta para ouvir palavra-chave
          if (
            transcript.includes('home') || transcript.includes('conexão') || transcript.includes('conexoes') ||
            transcript.includes('contato') || transcript.includes('configurações') || transcript.includes('configuracoes') ||
            transcript.includes('login') || transcript.includes('logar') || transcript.includes('cadastro') || transcript.includes('chat')
          ) {
            setListeningForKeyword(true);
          }
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('SpeechRecognition error', event.error);
      setMessage(`Erro: ${event.error}`);
    };

    recognition.onend = () => {
      // Sempre reinicia o reconhecimento para ficar sempre escutando
      recognition.start();
    };

    startListening();

    // Cleanup
    return () => {
      recognition.stop();
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [listeningForKeyword, navigate]);

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 15px', borderRadius: 8, zIndex: 9999 }}>
      {message}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <VoiceCommandHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conexoes" element={<Conexoes />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
