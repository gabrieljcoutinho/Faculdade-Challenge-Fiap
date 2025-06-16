// src/App.js
import React, { useState, useEffect } from 'react';
import './CSS/Reset.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


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
import ComandosChat from './routes/pages/ComandosChat';
import EsqueciSenha from './routes/pages/EsqueciSenha';
import HelpCenter from './routes/HelpCenter';

// Imagens para aparelhos
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';

function App() {
  const [conexions, setConexions] = useState(() => {
    const savedConexions = localStorage.getItem('conexions');
    return savedConexions ? JSON.parse(savedConexions) : [];
  });

  const [productionData, setProductionData] = useState({
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      {
        label: 'Produção (kWh)',
        data: [5, 12, 25, 30, 22, 15, 8],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  const handleUpdateProductionData = (newData) => {
    setProductionData(newData);
  };

  const handleConnectDevice = (deviceType, customName) => {
    setConexions((prevConexions) => {
      const finalDeviceName = customName || deviceType;
      const normalizedFinalDeviceName = finalDeviceName.toLowerCase();

      const existingDeviceIndex = prevConexions.findIndex(
        (c) => c.text.toLowerCase() === normalizedFinalDeviceName
      );

      let defaultIcon;
      let defaultColor;

      switch (deviceType) {
        case 'TV':
          defaultIcon = tvIcon;
          defaultColor = '#B0E0E6';
          break;
        case 'Ar-Condicionado':
          defaultIcon = airConditionerIcon;
          defaultColor = '#E0FFFF';
          break;
        case 'Lâmpada':
          defaultIcon = lampIcon;
          defaultColor = '#FFEBCD';
          break;
        case 'Airfry':
          defaultIcon = airfry;
          defaultColor = '#FFDAB9';
          break;
        case 'Carregador':
          defaultIcon = carregador;
          defaultColor = '#FFE4E1';
          break;
        default:
          defaultIcon = '';
          defaultColor = '#CCCCCC';
          break;
      }

      if (existingDeviceIndex !== -1) {
        return prevConexions.map((c, index) =>
          index === existingDeviceIndex
            ? { ...c, connected: true, icon: defaultIcon, backgroundColor: defaultColor }
            : c
        );
      } else {
        const newDevice = {
          id: crypto.randomUUID(),
          text: finalDeviceName,
          icon: defaultIcon,
          backgroundColor: defaultColor,
          connected: true,
        };
        return [...prevConexions, newDevice];
      }
    });
  };

  return (
      <div className="App">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route
              path="/"
              element={<Home productionData={productionData} onUpdateProductionData={handleUpdateProductionData} />}
            />
            <Route path="/conexoes" element={<Conexoes conexions={conexions} setConexions={setConexions} />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/login" element={<Logar />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/chat" element={<Chat onConnectDevice={handleConnectDevice} productionData={productionData} />} />
            <Route path="/comandosChat" element={<ComandosChat />} />
            <Route path="/esqueciSenha" element={<EsqueciSenha />} />
            <Route path="/helpCenter" element={<HelpCenter />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
  );
}

export default App;
