import React, { useState, useEffect, useRef } from 'react';
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

// Componente para reconhecimento de voz e navegação
function VoiceNavigator() {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o navegador suporta a Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Reconhecido:', transcript);

      if (!listening) {
        // Verifica se a palavra mágica "hades" foi falada para ativar o modo escuta
        if (transcript === 'hades') {
          setListening(true);
          console.log('Modo comando ativado, diga o destino.');
        }
      } else {
        // No modo escuta, a pessoa fala o nome da página
        // Mapeamento das palavras para rotas
        const rotas = {
          home: '/',
          conexoes: '/conexoes',
          contato: '/contato',
          configuracoes: '/configuracoes',
          login: '/login',
          cadastro: '/cadastro',
          chat: '/chat',
        };

        // Checar se o comando está em rotas
        if (transcript in rotas) {
          navigate(rotas[transcript]);
          console.log(`Navegando para ${rotas[transcript]}`);
        } else {
          console.log('Comando de rota não reconhecido:', transcript);
          alert('Comando não reconhecido. Tente novamente.');
        }

        // Desliga o modo escuta depois de reconhecer o comando
        setListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      // Pode tentar reiniciar ou avisar o usuário
      setListening(false);
    };

    recognition.onend = () => {
      // Se estava no modo escuta, pode tentar reiniciar para continuar ouvindo
      if (!listening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [listening, navigate]);

  // Estiliza a borda quando o modo comando estiver ativo
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        border: listening ? '5px solid rgba(15, 240, 252, 0.8)' : 'none',
        transition: 'border 0.3s ease',
        zIndex: 9999,
        borderRadius: '15px',
      }}
      aria-hidden="true"
    />
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <VoiceNavigator />
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
