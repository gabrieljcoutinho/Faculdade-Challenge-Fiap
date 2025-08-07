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
  const [conexions, setConexions] = useState(() => {
    try {
      const saved = localStorage.getItem('conexions');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map(c => ({
        ...c,
        id: c.id || window.crypto.randomUUID(),
        connectedDate: c.connectedDate || new Date().toISOString(),
        bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
          ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
          : null
      }));
    } catch (e) {
      console.error("Erro ao carregar conexões:", e);
      return [];
    }
  });

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
      localStorage.setItem('conexions', JSON.stringify(conexions.map(c => ({
        ...c,
        bluetoothDeviceInfo: c.bluetoothDeviceInfo ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name } : null
      }))));
    } catch (e) {
      console.error("Erro ao salvar conexões:", e);
    }
  }, [conexions]);

  useEffect(() => {
    localStorage.setItem('isReading', isReading);
  }, [isReading]);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useReadAloud(isReading);

  const handleConnectDevice = useCallback((nomeCompleto, iconSrc, backgroundColor = '#e0e0e0') => {
    setConexions(prev => {
      if (prev.some(c => c.text.toLowerCase() === nomeCompleto.toLowerCase())) return prev;
      return [...prev, {
        id: window.crypto.randomUUID(),
        text: nomeCompleto,
        icon: iconSrc,
        backgroundColor,
        connected: true,
        connectedDate: new Date().toISOString(),
        bluetoothDeviceInfo: null
      }];
    });
  }, []);

  const handleRemoveDevice = useCallback((id) => {
    setConexions(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleDisconnectAll = useCallback(() => {
    setConexions(prevConexions =>
      prevConexions.map(c => {
        if (c.connected) {
          let updatedConexion = { ...c, connected: false };
          if (c.connectedDate) {
            const [now, connectedStartTime] = [new Date().getTime(), new Date(c.connectedDate).getTime()];
            updatedConexion.accumulatedSeconds = (c.accumulatedSeconds || 0) + (now - connectedStartTime) / 1000;
            updatedConexion.connectedDate = null;
          }
          return updatedConexion;
        }
        return c;
      })
    );
  }, []);

  const handleRemoveAll = useCallback(() => {
    setConexions([]);
  }, []);

  const handleToggleConnection = useCallback((id, newDesiredState) => {
    setConexions(prev => prev.map(c =>
      c.id === id
        ? {
            ...c,
            connected: newDesiredState,
            connectedDate: newDesiredState ? new Date().toISOString() : null,
            accumulatedSeconds: newDesiredState ? c.accumulatedSeconds : (c.accumulatedSeconds || 0) + (new Date().getTime() - new Date(c.connectedDate).getTime()) / 1000
          }
        : c
    ));
  }, []);

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
                conexions={conexions}
                setConexions={setConexions}
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
                onConnectDevice={handleConnectDevice}
                onDisconnectAll={handleDisconnectAll}
                onRemoveAll={handleRemoveAll}
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

              <Route path="/timer" element={<Timer />} />

        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;