// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importe seus CSS e imagens
// Caminhos corrigidos para usar "./" assumindo que estas pastas são irmãs do arquivo App.js dentro de src
import './CSS/Reset.css'; // Seu CSS de reset
// Importa imagens (garanta que estes caminhos estejam corretos)
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';

// Importa os dados iniciais do gráfico de produção
import initialProductionData from './data/graficoHomeApi.json'; // Importação chave

// Components (ajuste os caminhos conforme sua estrutura de pastas)
import Header from './components/Header';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

// Pages (ajuste os caminhos conforme sua estrutura de pastas)
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

function App() {
  // Inicialização do estado 'conexions' lendo do localStorage
  const [conexions, setConexions] = useState(() => {
    try {
      const savedConexions = localStorage.getItem('conexions');
      // Garante que cada conexão armazenada tenha um ID único
      // E que 'bluetoothDeviceInfo' seja tratada corretamente
      return savedConexions
        ? JSON.parse(savedConexions).map(c => ({
            ...c,
            id: c.id || window.crypto.randomUUID(), // Garante que todos os itens tenham um ID
            connectedDate: c.connectedDate || new Date().toISOString(), // Garante data de conexão
            // Garante que bluetoothDeviceInfo seja um objeto ou null
            bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
              ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
              : null
          }))
        : [];
    } catch (e) {
      console.error("Erro ao carregar conexões do localStorage:", e);
      return []; // Retorna um array vazio em caso de erro
    }
  });

  // Estado para dados de produção, agora inicializado com o JSON importado
  const [productionData, setProductionData] = useState(initialProductionData); // Alteração aqui

  // Efeito para salvar 'conexions' no localStorage sempre que ele muda
  useEffect(() => {
    try {
      // Antes de salvar, garantimos que apenas os dados serializáveis de bluetoothDeviceInfo sejam mantidos
      const serializableConexions = conexions.map(c => ({
        ...c,
        bluetoothDeviceInfo: c.bluetoothDeviceInfo && typeof c.bluetoothDeviceInfo === 'object'
          ? { id: c.bluetoothDeviceInfo.id, name: c.bluetoothDeviceInfo.name }
          : null
      }));
      localStorage.setItem('conexions', JSON.stringify(serializableConexions));
    } catch (e) {
      console.error("Erro ao salvar conexões no localStorage:", e);
    }
  }, [conexions]);

  // A função handleUpdateProductionData agora pode ser removida ou adaptada
  // se você planeja atualizar esses dados em tempo real em outro lugar.
  // Por enquanto, ela não será usada se os dados forem estáticos.
  const handleUpdateProductionData = (newData) => {
    setProductionData(newData);
  };

  /**
   * Função central para conectar/ativar um aparelho.
   * Chamada pelo Chat, por QR Code, ou pela conexão Bluetooth.
   * @param {string} deviceName O nome do aparelho (pode ser o nome do Bluetooth Device ou nome customizado).
   * @param {string} uniqueId O ID único do aparelho (para Bluetooth, é o device.id; para manual, é um UUID).
   * @param {string} [icon=null] O caminho da imagem do ícone.
   * @param {string} [backgroundColor=null] A cor de fundo.
   * @param {object|null} [bluetoothDeviceInfo=null] Informações serializáveis do BluetoothDevice (id, name).
   */
  const handleConnectDevice = (deviceName, uniqueId, icon = null, backgroundColor = null, bluetoothDeviceInfo = null) => {
    setConexions((prevConexions) => {
      // Verifica se já existe um aparelho com o mesmo ID (prioriza IDs Bluetooth)
      // ou pelo ID customizado/gerado (para manual/QR Code)
      const existingDeviceIndex = prevConexions.findIndex(
        (c) => c.id === uniqueId || (c.bluetoothDeviceInfo && bluetoothDeviceInfo && c.bluetoothDeviceInfo.id === bluetoothDeviceInfo.id)
      );

      let defaultIcon = icon;
      let defaultColor = backgroundColor;

      // Se o ícone ou cor não foram fornecidos (ou são nulos), tenta inferir com base no nome
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
            // Mantém o ícone/cor fornecidos ou usa um fallback genérico
            defaultIcon = icon || lampIcon; // Fallback para ícone de lâmpada se nenhum for dado
            defaultColor = backgroundColor || '#CCCCCC'; // Fallback para cinza claro
            break;
        }
      }

      if (existingDeviceIndex !== -1) {
        console.log(`[handleConnectDevice] Aparelho "${deviceName}" (ID: ${uniqueId}) já existe. Atualizando status.`);
        return prevConexions.map((c, index) =>
          index === existingDeviceIndex
            ? {
                ...c,
                connected: true, // Garante que está conectado
                icon: defaultIcon, // Atualiza para o ícone (padrão ou fornecido)
                backgroundColor: defaultColor, // Atualiza para a cor (padrão ou fornecida)
                // Mantém o ID original
                id: c.id,
                // Atualiza a data de conexão apenas se o aparelho estava desconectado e agora está sendo conectado
                connectedDate: c.connected ? c.connectedDate : new Date().toISOString(),
                bluetoothDeviceInfo: bluetoothDeviceInfo // Atualiza/adiciona info Bluetooth
              }
            : c
        );
      } else {
        console.log(`[handleConnectDevice] Aparelho "${deviceName}" (ID: ${uniqueId}) NÃO existe. Adicionando novo.`);
        const newDevice = {
          id: uniqueId, // Usa o uniqueId fornecido (do Bluetooth ou UUID gerado)
          text: deviceName,
          icon: defaultIcon,
          backgroundColor: defaultColor,
          connected: true,
          connectedDate: new Date().toISOString(),
          bluetoothDeviceInfo: bluetoothDeviceInfo // Adiciona info Bluetooth (id e name)
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
   * @param {boolean} newDesiredState O novo estado de conexão desejado (true para conectado, false para desconectado).
   */
  const handleToggleConnection = (id, newDesiredState) => {
    setConexions(prevConexions => {
      return prevConexions.map(c => {
        if (c.id === id) {
          console.log(`[handleToggleConnection] Aparelho "${c.text}" (ID: ${id}) alterado para conectado: ${newDesiredState}`);
          return {
            ...c,
            connected: newDesiredState,
            // Atualiza a data de conexão apenas se estiver sendo conectado agora
            connectedDate: newDesiredState ? new Date().toISOString() : c.connectedDate
          };
        }
        return c;
      });
    });
  };

  // Estado do tema (exemplo, você pode ter o seu próprio gerenciamento de tema)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        {/* Passa o setTheme para ThemeToggle para que ele possa alterar o tema global */}
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
                onConnectDevice={handleConnectDevice} // Passa a função central para Conexoes
                onRemoveDevice={handleRemoveDevice}
                onToggleConnection={handleToggleConnection}
              />
            }
          />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/login" element={<Logar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          {/* Chat agora usa handleConnectDevice para conectar aparelhos e recebe productionData */}
          <Route
            path="/chat"
            element={
              <Chat
                onConnectDevice={handleConnectDevice}
                productionData={productionData}
                setTheme={setTheme} // Passa setTheme para Chat para que ele possa mudar o tema
              />
            }
          />
          <Route path="/comandosChat" element={<ComandosChat />} />
          <Route path="/esqueciSenha" element={<EsqueciSenha />} />
          <Route path="/helpCenter" element={<HelpCenter />} />
          <Route path="/perguntas-frequentes" element={<PerguntasFrequentes />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
