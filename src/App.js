// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe seus CSS e imagens
import './CSS/Reset.css';
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';

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

function App() {
  // Inicialização do estado 'conexions' lendo do localStorage
  const [conexions, setConexions] = useState(() => {
    try {
      const savedConexions = localStorage.getItem('conexions');
      // Garante que cada conexão armazenada tenha um ID único
      return savedConexions
        ? JSON.parse(savedConexions).map(c => ({
            ...c,
            id: c.id || window.crypto.randomUUID(), // Garante que todos os itens tenham um ID
            connectedDate: c.connectedDate || new Date().toISOString() // Garante data de conexão
          }))
        : [];
    } catch (e) {
      console.error("Erro ao carregar conexões do localStorage:", e);
      return []; // Retorna um array vazio em caso de erro
    }
  });

  // Estado para dados de produção (para o gráfico, etc.)
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

  // Efeito para salvar 'conexions' no localStorage sempre que ele muda
  useEffect(() => {
    try {
      localStorage.setItem('conexions', JSON.stringify(conexions));
    } catch (e) {
      console.error("Erro ao salvar conexões no localStorage:", e);
    }
  }, [conexions]);

  const handleUpdateProductionData = (newData) => {
    setProductionData(newData);
  };

  /**
   * Função central para conectar/ativar um aparelho.
   * Chamada pelo Chat ou por QR Code.
   * @param {string} deviceType O tipo genérico do aparelho (ex: 'TV', 'Lâmpada').
   * @param {string} customName O nome que o usuário deu ao aparelho (ex: 'TV Sala', 'Lâmpada Cozinha').
   */


  const handleConnectDevice = (deviceType, customName, icon = null, backgroundColor = null) => {
  setConexions((prevConexions) => {
    const finalDeviceName = customName || deviceType;
    const normalizedFinalDeviceName = finalDeviceName.toLowerCase();

    const existingDeviceIndex = prevConexions.findIndex(
      (c) => c.text.toLowerCase() === normalizedFinalDeviceName
    );

    let defaultIcon = icon;
    let defaultColor = backgroundColor;

    if (!icon || !backgroundColor) {
      switch (deviceType.toLowerCase()) {
        case 'tv':
          defaultIcon = tvIcon;
          defaultColor = '#B0E0E6';
          break;
        case 'ar-condicionado':
          defaultIcon = airConditionerIcon;
          defaultColor = '#E0FFFF';
          break;
        case 'lâmpada':
          defaultIcon = lampIcon;
          defaultColor = '#FFEBCD';
          break;
        case 'airfry':
          defaultIcon = airfry;
          defaultColor = '#FFDAB9';
          break;
        case 'carregador':
          defaultIcon = carregador;
          defaultColor = '#FFE4E1';
          break;
        default:
          defaultIcon = icon || ''; // ícone customizado ou vazio
          defaultColor = backgroundColor || '#CCCCCC';
          break;
      }
    }

    if (existingDeviceIndex !== -1) {
      console.log(`[handleConnectDevice] Aparelho "${finalDeviceName}" já existe. Atualizando status.`);
      return prevConexions.map((c, index) =>
        index === existingDeviceIndex
          ? {
              ...c,
              connected: true,
              icon: defaultIcon,
              backgroundColor: defaultColor,
              connectedDate: c.connected ? c.connectedDate : new Date().toISOString()
            }
          : c
      );
    } else {
      console.log(`[handleConnectDevice] Aparelho "${finalDeviceName}" NÃO existe. Adicionando novo.`);
      const newDevice = {
        id: window.crypto.randomUUID(),
        text: finalDeviceName,
        icon: defaultIcon,
        backgroundColor: defaultColor,
        connected: true,
        connectedDate: new Date().toISOString(),
      };
      return [...prevConexions, newDevice];
    }
  });
};




  /**
   * Função para remover um aparelho da lista.
   * Usada na página Conexões.
   * @param {string} id O ID único do aparelho a ser removido.
   */
  const handleRemoveDevice = (id) => {
    setConexions((prevConexions) => {
      // Filtra o aparelho pelo ID
      const updatedConexions = prevConexions.filter(c => c.id !== id);
      console.log(`[handleRemoveDevice] Aparelho com ID "${id}" removido.`);
      return updatedConexions;
    });
  };

  /**
   * Função para alternar o estado de conexão de um aparelho.
   * Usada na página Conexões (switch de ligar/desligar).
   * @param {string} id O ID único do aparelho a ser alternado.
   */
  const handleToggleConnection = (id) => {
    setConexions(prevConexions => {
      return prevConexions.map(c => {
        if (c.id === id) {
          const newConnectedState = !c.connected;
          console.log(`[handleToggleConnection] Aparelho "${c.text}" (ID: ${id}) alterado para conectado: ${newConnectedState}`);
          return {
            ...c,
            connected: newConnectedState,
            // Atualiza a data de conexão apenas se estiver sendo conectado agora
            connectedDate: newConnectedState ? new Date().toISOString() : c.connectedDate
          };
        }
        return c;
      });
    });
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <ThemeToggle />
        <Routes>
          <Route
            path="/"
            element={<Home productionData={productionData} onUpdateProductionData={handleUpdateProductionData} />}
          />
          <Route
            path="/conexoes"
            // Passamos as funções de manipulação diretamente para Conexoes
            element={
              <Conexoes
                conexions={conexions}
                setConexions={setConexions} // Mantido, mas handleRemoveDevice e handleToggleConnection são preferidos
                onConnectDevice={handleConnectDevice} // Para adicionar via QR Code/URL
                onRemoveDevice={handleRemoveDevice} // Nova prop para remover
                onToggleConnection={handleToggleConnection} // Nova prop para alternar estado
              />
            }
          />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Chat agora usa handleConnectDevice para conectar aparelhos */}
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