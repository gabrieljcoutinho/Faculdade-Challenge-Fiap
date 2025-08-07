import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CSS & Images
import '../src/CSS/Reset.css';
import '../src/CSS/mudarCorScrollBar.css';
import tvIcon from './imgs/imgConexao/TV.png';
import airConditionerIcon from '../src/imgs/imgConexao/ar-condicionado.png';
import airfry from '../src/imgs/imgConexao/airfry.png';
import lampIcon from '../src/imgs/imgConexao/lampada.png';
import carregador from '../src/imgs/imgConexao/carregador.png';

// Data
import initialProductionData from './data/graficoHomeApi.json';

// Components & Pages
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar';
import Cadastro from './routes/pages/Cadastro';
import Chat from './routes/pages/Chat';
import ComandosChat from './routes/pages/ComandosChat';
import EsqueciSenha from './routes/pages/EsqueciSenha';
import HelpCenter from '../src/routes/pages/HelpCenter';
import PerguntasFrequentes from './routes/pages/PerguntasFrequentes';
import NotFound from './routes/pages/NotFound';
import Timer from './routes/pages/Timer';

// --- Configurações dos Aparelhos Iniciais ---
const aparelhosDisponiveis = [
  { id: 1, imagem: tvIcon, nome: 'TV', corFundo: '#e0f7fa' },
  { id: 2, imagem: lampIcon, nome: 'Lâmpada', corFundo: '#fff9c4' },
  { id: 3, imagem: carregador, nome: 'Carregador', corFundo: '#ffe0b2' },
  { id: 4, imagem: airConditionerIcon, nome: 'Ar Condicionado', corFundo: '#d1c4e9' },
  { id: 5, imagem: airfry, nome: 'Airfryer', corFundo: '#c8e6c9' }
];

const getInitialAparelhos = () => {
  try {
    const storedAparelhos = localStorage.getItem('aparelhos');
    if (storedAparelhos) {
      return JSON.parse(storedAparelhos);
    }
  } catch (e) {
    console.error("Erro ao carregar aparelhos do localStorage:", e);
  }
  return aparelhosDisponiveis.map(a => ({
    ...a,
    agendamentos: [],
    conectado: false,
    connectedDate: null,
    accumulatedSeconds: 0
  }));
};

const useReadAloud = (isReading) => {
  useEffect(() => {
    if (!isReading) {
      window.speechSynthesis.cancel();
      return;
    }

    const handleClick = (e) => {
      const text = e.target.getAttribute('aria-label')
        || e.target.getAttribute('title')
        || e.target.innerText
        || e.target.alt
        || e.target.value
        || '';

      if (text.trim()) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      window.speechSynthesis.cancel();
    };
  }, [isReading]);
};

function App() {
  const [aparelhos, setAparelhos] = useState(getInitialAparelhos);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark-theme');
  const [isReading, setIsReading] = useState(() => localStorage.getItem('isReading') === 'true');
  const [chosenDatasetIndex, setChosenDatasetIndex] = useState(0);

  useEffect(() => {
    if (initialProductionData.datasetsOptions?.length) {
      setChosenDatasetIndex(Math.floor(Math.random() * initialProductionData.datasetsOptions.length));
    }
  }, []);

  const formattedProductionData = useMemo(() => {
    const chosen = initialProductionData.datasetsOptions?.[chosenDatasetIndex] || { label: '', data: [] };
    return {
      labels: initialProductionData.labels,
      datasets: [{
        label: chosen.label,
        data: chosen.data,
        borderColor: "#0FF0FC",
        backgroundColor: "rgba(15,240,252,0.3)",
        fill: true,
        tension: 0.3
      }]
    };
  }, [chosenDatasetIndex]);

  useEffect(() => {
    try {
      localStorage.setItem('aparelhos', JSON.stringify(aparelhos));
    } catch (e) {
      console.error("Erro ao salvar aparelhos:", e);
    }
  }, [aparelhos]);

  useEffect(() => {
    const checkAgendamentos = () => {
      const now = new Date();
      const diaAtual = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const horaAtual = now.getHours().toString().padStart(2, '0');
      const minutoAtual = now.getMinutes().toString().padStart(2, '0');
      const horarioAtual = `${horaAtual}:${minutoAtual}`;

      setAparelhos(prevAparelhos => {
        return prevAparelhos.map(aparelho => {
          let novoStatusConectado = false;
          if (aparelho.agendamentos.length > 0) {
            novoStatusConectado = aparelho.agendamentos.some(agendamento =>
              agendamento.dias.includes(diaAtual) && agendamento.horario === horarioAtual
            );
          }

          // Lógica de atualização de tempo acumulado e data de conexão
          let updatedConexion = { ...aparelho };
          if (updatedConexion.conectado && !novoStatusConectado) {
            // Se estava conectado e agora não está
            if (updatedConexion.connectedDate) {
              const nowTime = new Date().getTime();
              const connectedStartTime = new Date(updatedConexion.connectedDate).getTime();
              updatedConexion.accumulatedSeconds = (updatedConexion.accumulatedSeconds || 0) + (nowTime - connectedStartTime) / 1000;
            }
            updatedConexion.connectedDate = null;
          } else if (!updatedConexion.conectado && novoStatusConectado) {
            // Se não estava conectado e agora está
            updatedConexion.connectedDate = new Date().toISOString();
          }

          return { ...updatedConexion, conectado: novoStatusConectado };
        });
      });
    };

    const intervalId = setInterval(checkAgendamentos, 60000); // Checa a cada minuto

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    localStorage.setItem('isReading', isReading);
  }, [isReading]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useReadAloud(isReading);

  const toggleReading = useCallback(() => setIsReading(prev => !prev), []);

  const ReadAloudToggle = () => (
    <button
      onClick={toggleReading}
      style={{ fontSize: '16px', padding: '8px', marginLeft: '10px' }}
      title="Ativar/Desativar leitura em voz alta"
      aria-pressed={isReading}
    >
      {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
    </button>
  );

  const handleConnectDevice = useCallback((nomeCompleto, iconSrc, backgroundColor = '#e0e0e0') => {
    const newDevice = {
      id: window.crypto.randomUUID(),
      nome: nomeCompleto,
      imagem: iconSrc,
      corFundo: backgroundColor,
      conectado: true,
      agendamentos: [],
      connectedDate: new Date().toISOString(),
      accumulatedSeconds: 0
    };
    setAparelhos(prev => [...prev, newDevice]);
  }, []);

  const handleRemoveDevice = useCallback((id) => {
    setAparelhos(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleToggleConnection = useCallback((id, newDesiredState) => {
    setAparelhos(prev => prev.map(c => {
      if (c.id === id) {
        if (c.conectado && !newDesiredState) {
          const now = new Date().getTime();
          const connectedStartTime = new Date(c.connectedDate).getTime();
          return {
            ...c,
            conectado: false,
            connectedDate: null,
            accumulatedSeconds: (c.accumulatedSeconds || 0) + (now - connectedStartTime) / 1000
          };
        } else if (!c.conectado && newDesiredState) {
          return {
            ...c,
            conectado: true,
            connectedDate: new Date().toISOString()
          };
        }
      }
      return c;
    }));
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Header><ReadAloudToggle /></Header>
        <ThemeToggle setTheme={setTheme} />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                productionData={formattedProductionData}
                initialProductionData={initialProductionData}
                onDatasetChange={setChosenDatasetIndex}
              />
            }
          />
          <Route
            path="/conexoes"
            element={
              <Conexoes
                aparelhos={aparelhos}
                setAparelhos={setAparelhos}
                onConnectDevice={handleConnectDevice}
                onRemoveDevice={handleRemoveDevice}
                onToggleConnection={handleToggleConnection}
              />
            }
          />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes isReading={isReading} toggleReading={toggleReading} />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/chat"
            element={
              <Chat
                productionData={formattedProductionData}
                setTheme={setTheme}
              />
            }
          />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/timer" element={<Timer aparelhos={aparelhos} setAparelhos={setAparelhos} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;