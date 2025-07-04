import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import CSS e imagens
import './CSS/Reset.css';
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';

// Dados iniciais do gráfico
import initialProductionData from './data/graficoHomeApi.json';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

// Pages
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




// Hook para ativar leitura em voz alta globalmente
function useReadAloud(isReading) {
  useEffect(() => {
    if (!isReading) {
      window.speechSynthesis.cancel();
      return;
    }

    const handleClick = (event) => {
      const el = event.target;

      // Pega textos relevantes para leitura
      const textToRead =
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.innerText ||
        el.alt ||
        el.value ||
        '';

      if (textToRead.trim()) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
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
}


function App() {
  // Estado conexões
  const [conexions, setConexions] = useState(() => {
    try {
      const savedConexions = localStorage.getItem('conexions');
      return savedConexions
        ? JSON.parse(savedConexions).map(c => ({
            ...c,
            id: c.id || window.crypto.randomUUID(),
            connectedDate: c.connectedDate || new Date().toISOString(),
            bluetoothDeviceInfo:
              c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
                ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
                : null
          }))
        : [];
    } catch (e) {
      console.error("Erro ao carregar conexões do localStorage:", e);
      return [];
    }
  });

  // Estado dados de produção
  const [productionData, setProductionData] = useState(initialProductionData);

  // Salva conexões no localStorage ao mudar
  useEffect(() => {
    try {
      const serializableConexions = conexions.map(c => ({
        ...c,
        bluetoothDeviceInfo:
          c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
            ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
            : null
      }));
      localStorage.setItem('conexions', JSON.stringify(serializableConexions));
    } catch (e) {
      console.error("Erro ao salvar conexões no localStorage:", e);
    }
  }, [conexions]);

  const handleUpdateProductionData = (newData) => {
    setProductionData(newData);
  };

  const handleConnectDevice = (deviceName, uniqueId, icon = null, backgroundColor = null, bluetoothDeviceInfo = null) => {
    setConexions((prevConexions) => {
      const existingDeviceIndex = prevConexions.findIndex(
        (c) => c.id === uniqueId || (c.bluetoothDeviceInfo && bluetoothDeviceInfo && c.bluetoothDeviceInfo.id === bluetoothDeviceInfo.id)
      );

      let defaultIcon = icon;
      let defaultColor = backgroundColor;

      if (!icon || !backgroundColor) {
        switch (deviceName.toLowerCase()) {
          case 'tv':
          case 'televisão':
          case 'smart tv':
            defaultIcon = tvIcon;
            defaultColor = '#B0E0E6';
            break;
          case 'ar-condicionado':
          case 'ar':
          case 'ac':
            defaultIcon = airConditionerIcon;
            defaultColor = '#E0FFFF';
            break;
          case 'lâmpada':
          case 'lampada':
          case 'lamp':
            defaultIcon = lampIcon;
            defaultColor = '#FFEBCD';
            break;
          case 'airfry':
          case 'fritadeira':
            defaultIcon = airfry;
            defaultColor = '#FFDAB9';
            break;
          case 'carregador':
          case 'charger':
            defaultIcon = carregador;
            defaultColor = '#FFE4E1';
            break;
          default:
            defaultIcon = icon || lampIcon;
            defaultColor = backgroundColor || '#CCCCCC';
            break;
        }
      }

      if (existingDeviceIndex !== -1) {
        return prevConexions.map((c, index) =>
          index === existingDeviceIndex
            ? {
                ...c,
                connected: true,
                icon: defaultIcon,
                backgroundColor: defaultColor,
                id: c.id,
                connectedDate: c.connected ? c.connectedDate : new Date().toISOString(),
                bluetoothDeviceInfo: bluetoothDeviceInfo
              }
            : c
        );
      } else {
        const newDevice = {
          id: uniqueId,
          text: deviceName,
          icon: defaultIcon,
          backgroundColor: defaultColor,
          connected: true,
          connectedDate: new Date().toISOString(),
          bluetoothDeviceInfo: bluetoothDeviceInfo
        };
        return [...prevConexions, newDevice];
      }
    });
  };

  const handleRemoveDevice = (id) => {
    setConexions((prevConexions) => {
      return prevConexions.filter(c => c.id !== id);
    });
  };

  const handleToggleConnection = (id, newDesiredState) => {
    setConexions(prevConexions => {
      return prevConexions.map(c => {
        if (c.id === id) {
          return {
            ...c,
            connected: newDesiredState,
            connectedDate: newDesiredState ? new Date().toISOString() : c.connectedDate
          };
        }
        return c;
      });
    });
  };

  // Estado do tema
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Estado leitura em voz alta com persistência
  const [isReading, setIsReading] = useState(() => localStorage.getItem('isReading') === 'true' || false);

  useEffect(() => {
    localStorage.setItem('isReading', isReading);
  }, [isReading]);

  // Ativa o hook global de leitura em voz alta
  useReadAloud(isReading);

  // Função para alternar leitura
  const toggleReading = () => {
    setIsReading(prev => !prev);
  };


  // Botão de leitura global - pode passar para Header ou outro lugar global
  const ReadAloudToggle = () => (
    <button
      onClick={toggleReading}
      style={{ fontSize: '16px', padding: '8px', marginLeft: '10px' }}
      title="Ativar/Desativar leitura em voz alta"
    >
      {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
    </button>
  );

  return (
    <div className="App">
      <BrowserRouter>
        <Header>
          {/* Exemplo: adiciona botão leitura no Header */}
          <ReadAloudToggle />
        </Header>

        <ThemeToggle setTheme={setTheme} />

        <Routes>
          <Route
            path="/"
            element={<Home productionData={productionData} onUpdateProductionData={handleUpdateProductionData} />}
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
          <Route
            path="/configuracoes"
            element={
              <Configuracoes
                isReading={isReading}
                toggleReading={toggleReading}
              />
            }
          />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/chat"
            element={
              <Chat
                onConnectDevice={handleConnectDevice}
                productionData={productionData}
                setTheme={setTheme}
              />
            }
          />
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
