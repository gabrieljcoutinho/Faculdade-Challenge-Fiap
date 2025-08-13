import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CSS & Images
import '../src/CSS/Reset.css';
import '../src/CSS/mudarCorScrollBar.css';
import tvIcon from './imgs/imgConexao/TV.png';
import airConditionerIcon from '../src/imgs/imgConexao/ar-condicionado.png';
import geladeira from '../src/imgs/imgConexao/geladeira.png';
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
import HelpCenter from './routes/pages/HelpCenter';
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

const TAXA_CARREGAMENTO = 1;
const CONSUMO_POR_APARELHO = 0.5;

const getInitialAparelhos = () => {
  try {
    const stored = localStorage.getItem('aparelhos');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Erro ao carregar aparelhos:", e);
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
  const [connectionType, setConnectionType] = useState(() => localStorage.getItem('activeConnectionIcon') || 'cabo');

  const connectedDevicesCount = useMemo(() => aparelhos.filter(c => c.conectado).length, [aparelhos]);

  const [nivelBateria, setNivelBateria] = useState(() => {
    const saved = localStorage.getItem('nivelBateria');
    return saved !== null ? Number(saved) : 100;
  });

  const isCharging = (connectionType === 'bateria' && connectedDevicesCount === 0) || connectionType === 'cabo';
  const isDischarging = connectionType === 'bateria' && connectedDevicesCount > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setNivelBateria(prev => {
        let novoNivel = prev;
        const taxaConsumo = connectedDevicesCount * CONSUMO_POR_APARELHO;
        if (isDischarging) {
          novoNivel = Math.max(0, prev - taxaConsumo);
        } else if (isCharging) {
          novoNivel = Math.min(100, prev + TAXA_CARREGAMENTO);
        }
        localStorage.setItem('nivelBateria', novoNivel.toString());
        return novoNivel;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDischarging, isCharging, connectedDevicesCount]);

  useEffect(() => {
    localStorage.setItem('activeConnectionIcon', connectionType);
  }, [connectionType]);

  useEffect(() => {
    if (nivelBateria <= 0 && connectionType === 'bateria') {
      setConnectionType('cabo');
    }
  }, [nivelBateria, connectionType]);

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

  useEffect(() => { localStorage.setItem('aparelhos', JSON.stringify(aparelhos)); }, [aparelhos]);
  useEffect(() => { localStorage.setItem('isReading', isReading); }, [isReading]);
  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme); }, [theme]);

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

  const handleConnectDevice = useCallback((nome, icon, cor = '#e0e0e0', delay = 0) => {
    setTimeout(() => {
      if (aparelhos.find(c => c.nome.toLowerCase() === nome.toLowerCase())) return;
      const novo = {
        id: window.crypto.randomUUID(),
        nome,
        imagem: icon,
        corFundo: cor,
        conectado: true,
        agendamentos: [],
        connectedDate: new Date().toISOString(),
        accumulatedSeconds: 0
      };
      setAparelhos(prev => [...prev, novo]);
    }, delay);
  }, [aparelhos]);

  const handleRemoveDevice = useCallback((id) => {
    setAparelhos(prev => prev.filter(c => c.id !== id));
  }, []);

  // Alterei o nome da função para `handleRemoveAll` para ser mais claro
  const handleRemoveAll = useCallback(() => {
    setAparelhos([]);
  }, []);

  const handleDisconnectAllDevices = useCallback(() => {
    setAparelhos(prev => prev.map(c => ({
      ...c,
      conectado: false,
      connectedDate: null,
      accumulatedSeconds: c.connectedDate ? (c.accumulatedSeconds || 0) + ((new Date().getTime() - new Date(c.connectedDate).getTime()) / 1000) : c.accumulatedSeconds
    })));
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Header><ReadAloudToggle /></Header>
        <ThemeToggle setTheme={setTheme} />
        <Routes>
          <Route path="/" element={<Home productionData={formattedProductionData} initialProductionData={initialProductionData} onDatasetChange={setChosenDatasetIndex} />} />
          <Route path="/conexoes" element={<Conexoes aparelhos={aparelhos} setAparelhos={setAparelhos} onConnectDevice={handleConnectDevice} onRemoveDevice={handleRemoveDevice} onConnectionTypeChange={setConnectionType} activeConnectionIcon={connectionType} />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes isReading={isReading} toggleReading={toggleReading} />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Aqui, o chat recebe a função `onRemoveAll` com o nome correto */}
          <Route path="/chat" element={<Chat productionData={formattedProductionData} setTheme={setTheme} aparelhos={aparelhos} onConnectDevice={handleConnectDevice} onRemoveAll={handleRemoveAll} onDisconnectAllDevices={handleDisconnectAllDevices} onConnectionTypeChange={setConnectionType} />} />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/bateria" element={<Bateria isDischarging={isDischarging} isCharging={isCharging} nivelBateria={nivelBateria} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;