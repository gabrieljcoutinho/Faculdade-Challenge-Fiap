import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './CSS/Reset.css';
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';
import initialProductionData from './data/graficoHomeApi.json';

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
import HelpCenter from './routes/HelpCenter';
import PerguntasFrequentes from './routes/pages/PerguntasFrequentes';

// Hook para leitura em voz alta
const useReadAloud = (isReading) => {
  useEffect(() => {
    if (!isReading) return window.speechSynthesis.cancel();
    const handler = e => {
      const el = e.target;
      const txt = el.getAttribute('aria-label') || el.title || el.innerText || el.alt || el.value || '';
      if (txt.trim()) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(txt);
        utter.lang = 'pt-BR';
        window.speechSynthesis.speak(utter);
      }
    };
    document.addEventListener('click', handler);
    return () => {
      document.removeEventListener('click', handler);
      window.speechSynthesis.cancel();
    };
  }, [isReading]);
};

const App = () => {
  const [conexions, setConexions] = useState(() => {
    try {
      const saved = localStorage.getItem('conexions');
      return saved ? JSON.parse(saved).map(c => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        connectedDate: c.connectedDate || new Date().toISOString(),
        bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
          ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
          : null
      })) : [];
    } catch {
      return [];
    }
  });

  const [productionData, setProductionData] = useState(initialProductionData);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');
  const [isReading, setIsReading] = useState(localStorage.getItem('isReading') === 'true');

  useEffect(() => {
    const conexSave = conexions.map(c => ({
      ...c,
      bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
        ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
        : null
    }));
    localStorage.setItem('conexions', JSON.stringify(conexSave));
  }, [conexions]);

  useEffect(() => { document.body.className = theme; }, [theme]);
  useEffect(() => { localStorage.setItem('isReading', isReading); }, [isReading]);
  useReadAloud(isReading);

  const toggleReading = () => setIsReading(prev => !prev);
  const ReadAloudToggle = () => (
    <button onClick={toggleReading} style={{ fontSize: 16, padding: 8, marginLeft: 10 }} title="Ativar/Desativar leitura em voz alta">
      {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
    </button>
  );

  const handleConnectDevice = (name, id, icon = null, bg = null, info = null) => {
    const idx = conexions.findIndex(c => c.id === id || (c.bluetoothDeviceInfo && info && c.bluetoothDeviceInfo.id === info.id));
    const lower = name.toLowerCase();
    const defaults = {
      tv: [tvIcon, '#B0E0E6'], televisão: [tvIcon, '#B0E0E6'], 'smart tv': [tvIcon, '#B0E0E6'],
      'ar-condicionado': [airConditionerIcon, '#E0FFFF'], ar: [airConditionerIcon, '#E0FFFF'], ac: [airConditionerIcon, '#E0FFFF'],
      lâmpada: [lampIcon, '#FFEBCD'], lampada: [lampIcon, '#FFEBCD'], lamp: [lampIcon, '#FFEBCD'],
      airfry: [airfry, '#FFDAB9'], fritadeira: [airfry, '#FFDAB9'],
      carregador: [carregador, '#FFE4E1'], charger: [carregador, '#FFE4E1']
    };
    const [finalIcon, finalBg] = defaults[lower] || [icon || lampIcon, bg || '#CCCCCC'];

    setConexions(prev =>
      idx !== -1
        ? prev.map((c, i) => i === idx ? { ...c, connected: true, icon: finalIcon, backgroundColor: finalBg, bluetoothDeviceInfo: info, connectedDate: c.connected ? c.connectedDate : new Date().toISOString() } : c)
        : [...prev, { id, text: name, icon: finalIcon, backgroundColor: finalBg, connected: true, connectedDate: new Date().toISOString(), bluetoothDeviceInfo: info }]
    );
  };

  const handleRemoveDevice = id => setConexions(prev => prev.filter(c => c.id !== id));
  const handleToggleConnection = (id, state) => setConexions(prev => prev.map(c => c.id === id ? { ...c, connected: state, connectedDate: state ? new Date().toISOString() : c.connectedDate } : c));

  return (
    <div className="App">
      <BrowserRouter>
        <Header><ReadAloudToggle /></Header>
        <ThemeToggle setTheme={setTheme} />
        <Routes>
          <Route path="/" element={<Home productionData={productionData} onUpdateProductionData={setProductionData} />} />
          <Route path="/conexoes" element={<Conexoes conexions={conexions} setConexions={setConexions} onConnectDevice={handleConnectDevice} onRemoveDevice={handleRemoveDevice} onToggleConnection={handleToggleConnection} />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes isReading={isReading} toggleReading={toggleReading} />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/chat" element={<Chat onConnectDevice={handleConnectDevice} productionData={productionData} setTheme={setTheme} />} />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes isReading={isReading} />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;
