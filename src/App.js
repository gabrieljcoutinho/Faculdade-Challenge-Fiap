import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// CSS & Images
import '../src/CSS/Reset.css';
import '../src/CSS/mudarCorScrollBar.css';
import tvIcon from './imgs/imgConexao/TV.png';
import airConditionerIcon from '../src/imgs/imgConexao/ar-condicionado.png';
import geladeira from './imgs/imgConexao/geladeira.png';
import lampIcon from './imgs/imgConexao/lampada.png';
import carregador from './imgs/imgConexao/carregador.png';
import logoSplash from './imgs/imgHeader/logo.png'; // Sua logo

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

import InstallButtonMobile from '../src/components/InstallButtonMobile';

// Configurações iniciais
const aparelhosDisponiveis = [
  { id: 1, imagem: tvIcon, nome: 'TV', corFundo: '#e0f7fa' },
  { id: 2, imagem: lampIcon, nome: 'Lâmpada', corFundo: '#fff9c4' },
  { id: 3, imagem: carregador, nome: 'Carregador', corFundo: '#ffe0b2' },
  { id: 4, imagem: airConditionerIcon, nome: 'Ar Condicionado', corFundo: '#d1c4e9' },
  { id: 5, imagem: geladeira, nome: 'Geladeira', corFundo: '#c8e6c9' }
];

const TAXA_CARREGAMENTO = 1;
const CONSUMO_POR_APARELHO = 0.5;

// Função para carregar aparelhos do localStorage
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

// Hook de leitura em voz alta
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

// Splash Screen
const SplashScreen = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #252525, #fff)',
    flexDirection: 'column',
    zIndex: 9999
  }}>
    <div className="splash" style={{ textAlign: 'center', animation: 'fadeIn 1.5s ease' }}>
      <img src={logoSplash} alt="Logo Projeto GoodWe" style={{ animation: 'popIn 1.5s ease', maxWidth: '100%', height: 'auto' }} />
      <h1 style={{ fontSize: 'clamp(1rem, 2vw, 2rem)', marginTop: '20px', color: '#333', animation: 'slideUp 2s ease' }}>
        POJETO ACADÊMICO FACULDADE
      </h1>
      <div style={{
        margin: '30px auto 0',
        border: '8px solid #f3f3f3',
        borderTop: '8px solid #252525',
        borderRadius: '50%',
        width: 'clamp(60px, 10vw, 120px)',
        height: 'clamp(60px, 10vw, 120px)',
        animation: 'spin 1.5s linear infinite'
      }}></div>
    </div>
  </div>
);

// Hook para monitorar alertas do clima
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const LOCATION = 'São Paulo,BR';

const useWeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${WEATHER_API_KEY}&lang=pt&units=metric`);
        const data = await res.json();
        const newAlerts = [];

        if (data.weather?.some(w => w.main.toLowerCase().includes('rain'))) {
          newAlerts.push('🚨 Chuva detectada na região! Risco de enchentes.');
        }
        if (data.wind?.speed > 15) {
          newAlerts.push('⚠️ Ventos fortes! Verifique aparelhos externos.');
        }
        if (data.main?.temp < 0) {
          newAlerts.push('❄️ Temperaturas muito baixas! Possível congelamento de tubulações.');
        }

        setAlerts(newAlerts);
      } catch (err) {
        console.error('Erro ao buscar dados do clima:', err);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return alerts;
};

// App principal
function App() {


  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

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

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Controle da bateria
  useEffect(() => {
    const interval = setInterval(() => {
      setNivelBateria(prev => {
        let novoNivel = prev;
        const taxaConsumo = connectedDevicesCount * CONSUMO_POR_APARELHO;
        if (isDischarging) novoNivel = Math.max(0, prev - taxaConsumo);
        else if (isCharging) novoNivel = Math.min(100, prev + TAXA_CARREGAMENTO);
        localStorage.setItem('nivelBateria', novoNivel.toString());
        return novoNivel;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDischarging, isCharging, connectedDevicesCount]);

  useEffect(() => { localStorage.setItem('activeConnectionIcon', connectionType); }, [connectionType]);
  useEffect(() => { if (nivelBateria <= 0 && connectionType === 'bateria') setConnectionType('cabo'); }, [nivelBateria, connectionType]);

  useEffect(() => { if (initialProductionData.datasetsOptions?.length) setChosenDatasetIndex(Math.floor(Math.random() * initialProductionData.datasetsOptions.length)); }, []);

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
    <button onClick={toggleReading} style={{ fontSize: '16px', padding: '8px', marginLeft: '10px' }} title="Ativar/Desativar leitura em voz alta" aria-pressed={isReading}>
      {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
    </button>
  );

  // Conectar e remover aparelhos
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

  const handleRemoveDevice = useCallback((id) => setAparelhos(prev => prev.filter(c => c.id !== id)), []);
  const handleRemoveAll = useCallback(() => setAparelhos([]), []);
  const handleDisconnectAllDevices = useCallback(() => {
    setAparelhos(prev => prev.map(c => ({
      ...c,
      conectado: false,
      connectedDate: null,
      accumulatedSeconds: c.connectedDate ? (c.accumulatedSeconds || 0) + ((new Date().getTime() - new Date(c.connectedDate).getTime()) / 1000) : c.accumulatedSeconds
    })));
  }, []);
  const handleConnectionTypeChange = useCallback((type) => setConnectionType(type), []);

  // Hook de alertas climáticos
  const weatherAlerts = useWeatherAlerts();

  // Fala dos alertas
  useEffect(() => {
    if (weatherAlerts.length > 0 && isReading) {
      weatherAlerts.forEach(alert => {
        const utterance = new SpeechSynthesisUtterance(alert);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      });
    }
  }, [weatherAlerts, isReading]);

  return (
    <div className="App">
      <InstallButtonMobile />
      {showSplash ? (
        <div className={`splash ${fadeOut ? 'splash-fade-exit-active' : 'splash-fade-enter-active'}`}>
          <SplashScreen />
        </div>
      ) : (
        <BrowserRouter>
          {/* Alertas de risco */}
          {weatherAlerts.length > 0 && (
            <div style={{
              position: 'fixed',
              top: 10,
              right: 10,
              zIndex: 9999,
              backgroundColor: '#ffcccc',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              {weatherAlerts.map((alert, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>{alert}</div>
              ))}
            </div>
          )}

          <Header><ReadAloudToggle /></Header>
          <ThemeToggle setTheme={setTheme} />
          <Routes>
            <Route path="/" element={<Home productionData={formattedProductionData} initialProductionData={initialProductionData} onDatasetChange={setChosenDatasetIndex} />} />
            <Route path="/conectarAparelhos" element={<Conexoes aparelhos={aparelhos} setAparelhos={setAparelhos} onConnectDevice={handleConnectDevice} onRemoveDevice={handleRemoveDevice} onConnectionTypeChange={handleConnectionTypeChange} activeConnectionIcon={connectionType} />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/configuracoes" element={<Configuracoes isReading={isReading} toggleReading={toggleReading} />} />
            <Route path="/login" element={<Logar />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/chat" element={<Chat productionData={formattedProductionData} setTheme={setTheme} aparelhos={aparelhos} onConnectDevice={handleConnectDevice} onRemoveAll={handleRemoveAll} onDisconnectAllDevices={handleDisconnectAllDevices} onConnectionTypeChange={handleConnectionTypeChange} />} />
            <Route path="/comandosChat" element={<ComandosChat />} />
            <Route path="/esqueciSenha" element={<EsqueciSenha />} />
            <Route path="/helpCenter" element={<HelpCenter />} />
            <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/bateria" element={<Bateria isDischarging={isDischarging} isCharging={isCharging} nivelBateria={nivelBateria} />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
