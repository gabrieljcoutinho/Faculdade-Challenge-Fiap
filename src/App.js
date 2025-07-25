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

// Global Read Aloud Hook
const useReadAloud = (isReading) => {
  useEffect(() => {
    if (!isReading) return window.speechSynthesis.cancel();
    const handleClick = (e) => {
      const text = e.target.getAttribute('aria-label') || e.target.getAttribute('title') || e.target.innerText || e.target.alt || e.target.value || '';
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
  // State for connections, theme, and read-aloud
  const [conexions, setConexions] = useState(() => {
    try {
      const saved = localStorage.getItem('conexions');
      return saved ? JSON.parse(saved).map(c => ({ ...c, id: c.id || window.crypto.randomUUID(), connectedDate: c.connectedDate || new Date().toISOString(), bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object' ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name } : null })) : [];
    } catch (e) {
      console.error("Erro ao carregar conexões:", e);
      return [];
    }
  });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');
  const [isReading, setIsReading] = useState(() => localStorage.getItem('isReading') === 'true');

  // NOVO ESTADO: O índice do dataset escolhido, para que o App.js saiba qual dataset formatar.
  // Home.js precisará de uma forma de notificar o App.js sobre a mudança desse índice.
  const [chosenDatasetIndex, setChosenDatasetIndex] = useState(0);

  // Efeito para escolher um dataset inicial aleatoriamente na montagem
  useEffect(() => {
    if (initialProductionData.datasetsOptions && initialProductionData.datasetsOptions.length > 0) {
      setChosenDatasetIndex(Math.floor(Math.random() * initialProductionData.datasetsOptions.length));
    }
  }, []);

  // NOVO: `productionData` agora é calculado no App.js usando `useMemo`
  // Ele usa `initialProductionData` e `chosenDatasetIndex` para criar o formato esperado.
  const formattedProductionData = useMemo(() => {
    if (!initialProductionData.datasetsOptions || initialProductionData.datasetsOptions.length === 0) {
      return { labels: [], datasets: [] };
    }
    const chosen = initialProductionData.datasetsOptions[chosenDatasetIndex] || initialProductionData.datasetsOptions[0];
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
  }, [chosenDatasetIndex]); // Recalcula quando chosenDatasetIndex muda

  // Effects for persistence and theme class
  useEffect(() => {
    try {
      localStorage.setItem('conexions', JSON.stringify(conexions.map(c => ({ ...c, bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object' ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name } : null }))));
    } catch (e) { console.error("Erro ao salvar conexões:", e); }
  }, [conexions]);
  useEffect(() => { localStorage.setItem('isReading', isReading); }, [isReading]);
  useEffect(() => { document.body.className = theme; }, [theme]);

  // Activate global read-aloud hook
  useReadAloud(isReading);

  // Connection handlers
  const handleConnectDevice = useCallback((deviceName, uniqueId, icon = null, backgroundColor = null, bluetoothDeviceInfo = null) => {
    setConexions(prev => {
      const existingIdx = prev.findIndex(c => c.id === uniqueId || (c.bluetoothDeviceInfo && bluetoothDeviceInfo && c.bluetoothDeviceInfo.id === bluetoothDeviceInfo.id));
      let [defIcon, defColor] = [icon, backgroundColor];
      if (!icon || !backgroundColor) {
        switch (deviceName.toLowerCase()) {
          case 'tv': case 'televisão': case 'smart tv': [defIcon, defColor] = [tvIcon, '#B0E0E6']; break;
          case 'ar-condicionado': case 'ar': case 'ac': [defIcon, defColor] = [airConditionerIcon, '#E0FFFF']; break;
          case 'lâmpada': case 'lampada': case 'lamp': [defIcon, defColor] = [lampIcon, '#FFEBCD']; break;
          case 'airfry': case 'fritadeira': [defIcon, defColor] = [airfry, '#FFDAB9']; break;
          case 'carregador': case 'charger': [defIcon, defColor] = [carregador, '#FFE4E1']; break;
          default: [defIcon, defColor] = [icon || lampIcon, backgroundColor || '#CCCCCC']; break;
        }
      }
      return existingIdx !== -1
        ? prev.map((c, i) => i === existingIdx ? { ...c, connected: true, icon: defIcon, backgroundColor: defColor, connectedDate: c.connected ? c.connectedDate : new Date().toISOString(), bluetoothDeviceInfo } : c)
        : [...prev, { id: uniqueId, text: deviceName, icon: defIcon, backgroundColor: defColor, connected: true, connectedDate: new Date().toISOString(), bluetoothDeviceInfo }];
    });
  }, []);

  const handleRemoveDevice = useCallback((id) => setConexions(prev => prev.filter(c => c.id !== id)), []);

  const handleToggleConnection = useCallback((id, newDesiredState) => {
    setConexions(prev => prev.map(c => c.id === id ? { ...c, connected: newDesiredState, connectedDate: newDesiredState ? new Date().toISOString() : c.connectedDate } : c));
  }, []);

  // Toggle for Read Aloud
  const toggleReading = useCallback(() => setIsReading(prev => !prev), []);
  const ReadAloudToggle = () => (
    <button onClick={toggleReading} style={{ fontSize: '16px', padding: '8px', marginLeft: '10px' }} title="Ativar/Desativar leitura em voz alta">
      {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
    </button>
  );

  return (
    <div className="App">
      <BrowserRouter>
        <Header><ReadAloudToggle /></Header>
        <ThemeToggle setTheme={setTheme} />
        <Routes>
          {/* Home agora recebe o productionData formatado do App.js e uma função para mudar o dataset */}
          <Route
            path="/"
            element={
              <Home
                productionData={formattedProductionData} // Passa o productionData já formatado
                initialProductionData={initialProductionData} // Passa os dados brutos para Home escolher qual dataset
                onDatasetChange={setChosenDatasetIndex} // Home pode notificar App.js qual dataset escolheu
              />
            }
          />
          <Route path="/conexoes" element={<Conexoes conexions={conexions} setConexions={setConexions} onConnectDevice={handleConnectDevice} onRemoveDevice={handleRemoveDevice} onToggleConnection={handleToggleConnection} />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes isReading={isReading} toggleReading={toggleReading} />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Chat agora recebe o productionData formatado do App.js */}
          <Route path="/chat" element={<Chat onConnectDevice={handleConnectDevice} productionData={formattedProductionData} setTheme={setTheme} />} />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;