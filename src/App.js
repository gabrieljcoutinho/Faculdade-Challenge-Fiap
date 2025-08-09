import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CSS & Images
import '../src/CSS/Reset.css';
import '../src/CSS/mudarCorScrollBar.css';
import tvIcon from './imgs/imgConexao/TV.png';
import airConditionerIcon from '../src/imgs/imgConexao/ar-condicionado.png';
import geladeira from '../src/imgs/imgConexao/geladeira.png';
import lampIcon from '../src/imgs/imgConexao/lampada.png';
import carregador from '../src/imgs/imgConexao/carregador.png';
import caboIcon from '../src/imgs/imgConexao/cabo.png';
import bateriaIcon from '../src/imgs/imgConexao/bateria.png';

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
import Bateria from './routes/pages/Bateria';

const aparelhosDisponiveis = [
  { id: 1, imagem: tvIcon, nome: 'TV', corFundo: '#e0f7fa' },
  { id: 2, imagem: lampIcon, nome: 'Lâmpada', corFundo: '#fff9c4' },
  { id: 3, imagem: carregador, nome: 'Carregador', corFundo: '#ffe0b2' },
  { id: 4, imagem: airConditionerIcon, nome: 'Ar Condicionado', corFundo: '#d1c4e9' },
  { id: 5, imagem: geladeira, nome: 'Geladeira', corFundo: '#c8e6c9' }
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

  const [connectionType, setConnectionType] = useState(() => {
    const savedType = localStorage.getItem('activeConnectionIcon');
    return savedType || 'cabo';
  });

  const connectedDevicesCount = useMemo(() => aparelhos.filter(c => c.conectado).length, [aparelhos]);

  const isCharging = useMemo(() => {
    return connectionType === 'cabo';
  }, [connectionType]);

  const isDischarging = useMemo(() => {
    return connectionType === 'bateria' && connectedDevicesCount > 0;
  }, [connectionType, connectedDevicesCount]);

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
    localStorage.setItem('isReading', isReading);
  }, [isReading]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeConnectionIcon', connectionType);
  }, [connectionType]);

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

  const handleConnectDevice = useCallback((nomeCompleto, iconSrc, backgroundColor = '#e0e0e0', delay = 0) => {
    setTimeout(() => {
      const existingDevice = aparelhos.find(c => c.nome.toLowerCase() === nomeCompleto.toLowerCase());
      if (existingDevice) {
        console.warn(`Aparelho "${nomeCompleto}" já existe.`);
        return;
      }
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
    }, delay);
  }, [aparelhos]);

  const handleRemoveDevice = useCallback((id) => {
    setAparelhos(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleRemoveAllDevices = useCallback(() => {
    setAparelhos([]);
  }, []);

  const handleDisconnectAllDevices = useCallback(() => {
    setAparelhos(prevAparelhos => prevAparelhos.map(c => ({
      ...c,
      conectado: false,
      connectedDate: null,
      accumulatedSeconds: (c.connectedDate ? (c.accumulatedSeconds || 0) + (new Date().getTime() - new Date(c.connectedDate).getTime()) / 1000 : c.accumulatedSeconds)
    })));
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
                onConnectionTypeChange={setConnectionType}
                activeConnectionIcon={connectionType}
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
                aparelhos={aparelhos}
                onConnectDevice={handleConnectDevice}
                onRemoveAllDevices={handleRemoveAllDevices}
                onDisconnectAllDevices={handleDisconnectAllDevices}
              />
            }
          />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
          <Route path="*" element={<NotFound />} />
          <Route
            path="/bateria"
            element={
              <Bateria
                isDischarging={isDischarging}
                isCharging={isCharging}
              />
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;