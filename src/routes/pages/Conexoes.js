import React, { useState, useEffect, useRef } from 'react'; // Adicionado useRef para persistir GATT server
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';

// Importa todos os arquivos CSS
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import '../../CSS/Conexao/edit.css';
import '../../CSS/Conexao/saveBtn.css';
import '../../CSS/Conexao/icon.css';
import '../../CSS/Conexao/adicionar.css';
import '../../CSS/Conexao/slideIn.css';
import '../../CSS/Conexao/slideOut.css';
import '../../CSS/Conexao/error.css';
import '../../CSS/Conexao/escolherFundo.css';
import '../../CSS/Conexao/botaoSwitch.css';
import '../../CSS/Conexao/qrCode.css';
import '../../CSS/Conexao/detalhesAparelhos.css';
import '../../CSS/Conexao/imgNaoConectado.css';
import '../../CSS/Conexao/mensagemRemoverAparelho.css';
import '../../CSS/Conexao/mensagemMuitosAprelhosConectadosAoMesmoTempo.css';

// Importa imagens
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png';

// Constantes
const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";
const DEVICE_LIMIT = 5;

// Ícones disponíveis
const availableIcons = [
  { name: 'tv', src: tvIcon },
  { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon },
  { name: 'airfry', src: airfry },
  { name: 'carregador', src: carregador }
];

// Mapa de ícones para acesso rápido
const iconMap = availableIcons.reduce((acc, icon) => {
  acc[icon.name] = icon.src;
  return acc;
}, {});

// =========================================================================
// !!! ATENÇÃO: ESTES SÃO UUIDs HIPOTÉTICOS !!!
// VOCÊ PRECISA SUBSTITUIR PELOS UUIDs REAIS DO SEU APARELHO.
// Use ferramentas como nRF Connect (mobile) ou a aba "Application" -> "Bluetooth" do Chrome DevTools
// para inspecionar os serviços e características do seu dispositivo.
const YOUR_DEVICE_SERVICE_UUID = 'your_custom_service_uuid_here'; // Ex: '19B10000-E8F2-537E-4F6C-D104768A1214'
const YOUR_POWER_CHARACTERISTIC_UUID = 'your_power_characteristic_uuid_here'; // Ex: '19B10001-E8F2-537E-4F6C-D104768A1214'
// =========================================================================

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  // Estados de UI
  const [showAddForm, setShowAddForm] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  // Ref para armazenar os objetos BluetoothDevice e GATTServer ativos
  // Isso permite que a conexão persista enquanto o componente está montado
  const activeBluetoothDevices = useRef({}); // { deviceId: { bluetoothDevice: obj, gattServer: obj } }

  // Dados do formulário
  const [newConexion, setNewConexion] = useState({
    text: '',
    icon: '',
    backgroundColor: availableColors[0],
    connected: true,
    connectedDate: new Date().toISOString()
  });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  // Limpa refs de Bluetooth quando o componente é desmontado
  useEffect(() => {
    return () => {
      Object.values(activeBluetoothDevices.current).forEach(({ gattServer }) => {
        if (gattServer && gattServer.connected) {
          gattServer.disconnect();
          console.log("Desconectado GATT server ao desmontar componente.");
        }
      });
      activeBluetoothDevices.current = {}; // Limpa a ref
    };
  }, []);

  // Handle params URL para adicionar direto
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('add');
    const iconKey = params.get('icon');

    if (nome && iconKey && iconMap[iconKey]) {
      if (conexions.length >= DEVICE_LIMIT) {
        setShowLimitWarning(true);
      } else {
        // Para aparelhos adicionados via URL, eles são considerados "virtuais"
        // sem uma conexão Bluetooth ativa real por padrão.
        onConnectDevice(nome, nome, iconMap[iconKey], availableColors[0], null, null);
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions.length]);

  // Função para obter o nome do ícone a partir do src
  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  // Abrir formulário para adicionar (modo bluetooth por padrão)
  const handleAddClick = () => {
    setNewConexion({
      text: '',
      icon: '',
      backgroundColor: availableColors[0],
      connected: true,
      connectedDate: new Date().toISOString()
    });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false);
    setShowAddForm(true);
    setIsSearchingBluetooth(false);
    setModoManual(false); // Sempre começar em modo Bluetooth ao abrir
  };

  // Abrir formulário manual
  const abrirModoManual = () => {
    setModoManual(true);
    setNewConexion({
      text: '',
      icon: '',
      backgroundColor: availableColors[0],
      connected: true,
      connectedDate: new Date().toISOString()
    });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setErrorMessage('');
    setEditingId(null);
    setIsSearchingBluetooth(false);
  };

  // =====================================================================
  // *** FUNÇÃO CENTRAL PARA CONTROLE REAL DO APARELHO BLUETOOTH ***
  // =====================================================================
  const controlBluetoothDevicePower = async (device, server, enable) => {
    if (!device || !server || !server.connected) {
      throw new Error("Conexão Bluetooth não está ativa para este dispositivo.");
    }

    try {
      // 1. Obter o Serviço
      const service = await server.getPrimaryService(YOUR_DEVICE_SERVICE_UUID);
      console.log('Serviço Bluetooth encontrado:', service.uuid);

      // 2. Obter a Característica de Controle de Energia
      const characteristic = await service.getCharacteristic(YOUR_POWER_CHARACTERISTIC_UUID);
      console.log('Característica de controle de energia encontrada:', characteristic.uuid);

      // 3. Preparar o valor para escrita (MUITO IMPORTANTE: AJUSTE PARA O SEU APARELHO)
      // Exemplo: new Uint8Array([1]) para LIGAR, new Uint8Array([0]) para DESLIGAR
      const valueToWrite = new Uint8Array([enable ? 1 : 0]); // OU [0x01] para ON, [0x00] para OFF

      // 4. Escrever o valor na Característica
      await characteristic.writeValue(valueToWrite);
      console.log(`Comando de energia enviado para ${device.name}: ${enable ? 'LIGAR' : 'DESLIGAR'}`);
      return true; // Sucesso
    } catch (error) {
      console.error(`Erro ao controlar o aparelho Bluetooth ${device.name}:`, error);
      // Aqui você pode adicionar lógica para reconectar se a conexão caiu
      if (error.message.includes('disconnected')) {
        setErrorMessage('O aparelho Bluetooth foi desconectado. Tente reconectar.');
        // Opcional: Remover o aparelho da lista ou marcá-lo como desconectado
      }
      throw error; // Propagar o erro para ser tratado no toggleConnection
    }
  };

  // Buscar dispositivos Bluetooth e conectar
  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) {
      setErrorMessage('Seu navegador não suporta Web Bluetooth. Use Chrome, Edge ou Opera.');
      return;
    }

    if (conexions.length >= DEVICE_LIMIT) {
      setShowLimitWarning(true);
      return;
    }

    setIsSearchingBluetooth(true);
    setErrorMessage('');

    try {
      // Solicita o dispositivo. Isso abre a UI do navegador.
      // Você pode tentar filtrar por serviços se tiver os UUIDs.
      // Ex: { filters: [{ services: [YOUR_DEVICE_SERVICE_UUID] }] }
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });

      if (!device) {
        setErrorMessage('Nenhum aparelho Bluetooth selecionado.');
        return;
      }

      // Tenta conectar ao GATT Server IMEDIATAMENTE após a seleção
      const server = await device.gatt.connect();
      console.log(`Conectado ao GATT server do aparelho: ${device.name || 'Desconhecido'}`);

      // Armazena a referência do dispositivo e do servidor GATT
      // Isso é CRUCIAL para poder interagir com ele depois
      activeBluetoothDevices.current[device.id] = { bluetoothDevice: device, gattServer: server };

      // Opcional: Adicionar um ouvinte para desconexão
      device.addEventListener('gattserverdisconnected', () => {
        console.log(`GATT server de ${device.name} (${device.id}) desconectado.`);
        // Atualize o estado do seu aplicativo para mostrar que o aparelho está desconectado
        // Por exemplo, você pode chamar onToggleConnection(device.id, false)
        onToggleConnection(device.id, false);
        delete activeBluetoothDevices.current[device.id]; // Remove da ref quando desconectado
      });

      const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';

      let guessedIcon = lampIcon; // Fallback padrão
      const name = deviceName.toLowerCase();

      // --- ALTERAÇÃO AQUI: Melhorando o mapeamento de ícones ---
      if (name.includes('tv') || name.includes('televisão') || name.includes('smart tv') || name.includes('monitor') || name.includes('samsung tv') || name.includes('lg tv') || name.includes('roku tv') || name.includes('fire tv') || name.includes('madara akatsuki')) {
        guessedIcon = tvIcon;
      } else if (name.includes('ar') || name.includes('ac') || name.includes('condicionado') || name.includes('split') || name.includes('climatizador')) {
        guessedIcon = airConditionerIcon;
      } else if (name.includes('lamp') || name.includes('lâmpada') || name.includes('lampada') || name.includes('led') || name.includes('smart light') || name.includes('bulb')) {
        guessedIcon = lampIcon;
      } else if (name.includes('airfry') || name.includes('fritadeira') || name.includes('fritadeira eletrica')) {
        guessedIcon = airfry;
      } else if (name.includes('carregador') || name.includes('charger') || name.includes('usb') || name.includes('power bank')) {
        guessedIcon = carregador;
      }
      // --- FIM DA ALTERAÇÃO ---

      // Verifica se já existe um aparelho com este ID Bluetooth (evita duplicatas reais)
      if (conexions.some(c => c.bluetoothDevice && c.bluetoothDevice.id === device.id)) {
        setErrorMessage(`Este aparelho Bluetooth (${deviceName}) já está na sua lista.`);
        server.disconnect(); // Desconecta imediatamente se for duplicado
        delete activeBluetoothDevices.current[device.id];
        return;
      }

      onConnectDevice(deviceName, device.id, guessedIcon, availableColors[0], device, server);
      setShowAddForm(false);

    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      if (error.name === 'NotFoundError') setErrorMessage('Nenhum aparelho Bluetooth encontrado ou selecionado.');
      else if (error.name === 'NotAllowedError') setErrorMessage('Permissão de Bluetooth negada ou usuário cancelou.');
      else if (error.message.includes('User cancelled')) setErrorMessage('Seleção de aparelho Bluetooth cancelada.');
      else setErrorMessage('Falha na conexão Bluetooth: ' + error.message);
    } finally {
      setIsSearchingBluetooth(false);
    }
  };

  // Salvar edição do dispositivo
  const saveEditedConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) {
      setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊');
      return;
    }

    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`);
      return;
    }

    setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate, bluetoothDevice: c.bluetoothDevice } : c));
    setShowAddForm(false);
    setModoManual(false);
    setErrorMessage('');
  };

  // Solicitar remoção do aparelho (abre confirmação)
  const removeConexion = (id) => {
    setConexionToDelete(id);
    setShowConfirmDialog(true);
  };

  // Confirmar remoção do aparelho
  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete);
      // Desconecta o GATT server se estiver ativo para este aparelho
      const deviceRef = activeBluetoothDevices.current[conexionToDelete];
      if (deviceRef && deviceRef.gattServer && deviceRef.gattServer.connected) {
        deviceRef.gattServer.disconnect();
        console.log(`Desconectado GATT server para aparelho ${conexionToDelete} antes de remover.`);
      }
      delete activeBluetoothDevices.current[conexionToDelete]; // Remove da ref

      setTimeout(() => {
        onRemoveDevice(conexionToDelete); // Remove do estado global
        setRemovingId(null);
        setSelectedConexion(null);
        setConexionToDelete(null);
        setShowConfirmDialog(false);
      }, 300);
    }
  };

  // Cancelar remoção
  const handleCancelRemove = () => {
    setConexionToDelete(null);
    setShowConfirmDialog(false);
  };

  // Abrir edição do dispositivo
  const handleEditClick = (c) => {
    // Permite editar mesmo se estiver desconectado, mas o controle Bluetooth
    // só funcionaria se estiver conectado.
    setNewConexion({
      text: c.text,
      icon: c.icon,
      backgroundColor: c.backgroundColor || availableColors[0],
      connected: c.connected,
      connectedDate: c.connectedDate
    });
    setActiveIcon(c.icon);
    setActiveColor(c.backgroundColor || availableColors[0]);
    setEditingId(c.id);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false);
    setShowAddForm(true);
    setIsSearchingBluetooth(false);
    setModoManual(true); // Modo formulário para editar
  };

  // Alternar status conexão (on/off) - AGORA CONTROLA O APARELHO REALMENTE!
  const toggleConnection = async (id, currentConnectedState) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion) return;

    // A nova estado desejado (se estava conectado, queremos desligar; se não, queremos ligar)
    const newDesiredState = !currentConnectedState;

    // Tenta controlar o aparelho Bluetooth real se ele foi conectado via Bluetooth API
    const bluetoothRef = activeBluetoothDevices.current[id];

    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        // Chama a função de controle Bluetooth
        await controlBluetoothDevicePower(bluetoothRef.bluetoothDevice, bluetoothRef.gattServer, newDesiredState);
        // Se o comando foi bem-sucedido, atualiza o estado visual
        onToggleConnection(id, newDesiredState);
        if (selectedConexion && selectedConexion.id === id && !newDesiredState) {
          setSelectedConexion(null); // Fecha detalhes se desligou
        }
      } catch (error) {
        console.error("Falha ao enviar comando Bluetooth:", error);
        setErrorMessage(`Não foi possível controlar ${conexion.text}. O aparelho pode estar fora de alcance ou desconectado.`);
        // Mantém o estado visual antigo ou força para desconectado se houve erro de comunicação real
        onToggleConnection(id, false); // Força para desconectado no UI em caso de erro no controle real
      }
    } else {
      // Se não é um aparelho Bluetooth real ou não tem ref ativa, apenas alterna o estado visual
      onToggleConnection(id, newDesiredState);
      if (selectedConexion && selectedConexion.id === id && !newDesiredState) {
        setSelectedConexion(null);
      }
    }
  };

  // Abrir modal detalhes do dispositivo
  const handleConexionClick = (c) => {
    // Mostra detalhes apenas se estiver conectado ou se for um aparelho manual
    // Para aparelhos Bluetooth, ele deve estar 'connected' no seu estado.
    setSelectedConexion(c);
  };

  // Formatação da data
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Calcular duração de conexão
  const getConnectionDuration = (connectedDateString) => {
    if (!connectedDateString) return 'N/A';
    const connected = new Date(connectedDateString);
    const now = new Date();
    const diff = now - connected;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let duration = [];
    if (days > 0) duration.push(`${days} dia(s)`);
    if (hours % 24 > 0) duration.push(`${hours % 24} hora(s)`);
    if (minutes % 60 > 0 && days === 0) duration.push(`${minutes % 60} minuto(s)`);
    if (seconds % 60 > 0 && hours === 0 && days === 0) duration.push(`${seconds % 60} segundo(s)`);

    if (duration.length === 0) return 'Menos de um segundo';
    return duration.join(' e ');
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>

      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {conexions.length === 0 && !showAddForm && (
        <div className="placeholder-image-container">
          <br /><br /><br />
          <img src={placeholderImage} alt="Nenhum aparelho conectado" className="placeholder-image" />
          <p className="placeholder-text">Nenhum aparelho conectado...</p>
        </div>
      )}

      {/* Formulário para adicionar ou editar aparelho */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : modoManual ? 'Adicionar Novo Aparelho Manualmente' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {(editingId || modoManual) ? (
              <>
                <input
                  type="text"
                  placeholder="Nome do Aparelho"
                  value={newConexion.text}
                  onChange={(e) => setNewConexion({ ...newConexion, text: e.target.value })}
                />
                <div className="icon-picker-styled">
                  <label>Escolha o ícone:</label>
                  <div className="icons">
                    {availableIcons.map(icon => (
                      <button
                        key={icon.name}
                        className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                        onClick={() => { setNewConexion({ ...newConexion, icon: icon.src }); setActiveIcon(icon.src); }}
                        type="button"
                      >
                        <img src={icon.src} alt={icon.name} style={{ width: 30, height: 30 }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className="tipoDoFundoConexao">Escolha a cor de fundo:</label>
                  <div className="colors">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${activeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    onClick={editingId ? saveEditedConexion : () => {
                      if (!newConexion.text.trim() || !newConexion.icon) {
                        setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊');
                        return;
                      }
                      if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase())) {
                        setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`);
                        return;
                      }
                      // Para aparelhos adicionados manualmente, não há BluetoothDevice
                      onConnectDevice(
                        newConexion.text,
                        Date.now().toString(), // ID único para aparelhos manuais
                        newConexion.icon,
                        newConexion.backgroundColor,
                        null, // bluetoothDevice
                        null  // bluetoothGattServer
                      );
                      setShowAddForm(false);
                      setModoManual(false);
                      setErrorMessage('');
                    }}
                    className="save-button-styled"
                    type="button"
                  >
                    {editingId ? 'Salvar Edição' : 'Adicionar Aparelho'}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setModoManual(false); setErrorMessage(''); }}
                    className="cancel-button-styled"
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Clique no botão abaixo para procurar e conectar aparelhos Bluetooth próximos:</p>
                <button
                  onClick={handleSearchAndConnectBluetooth}
                  className="add-button-styled"
                  disabled={isSearchingBluetooth}
                  type="button"
                >
                  {isSearchingBluetooth ? 'Procurando Aparelhos...' : 'Procurar Aparelhos Bluetooth'}
                </button>
                <button
                  onClick={abrirModoManual}
                  className="add-button-styled"
                  style={{ marginTop: '10px' }}
                  disabled={isSearchingBluetooth}
                  type="button"
                >
                  Adicionar Aparelho Manualmente
                </button>
                {isSearchingBluetooth && (
                  <p className="connecting-message">Aguarde, a janela de seleção do navegador será aberta.</p>
                )}
                <div className="form-actions">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="cancel-button-styled"
                    disabled={isSearchingBluetooth}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Lista de aparelhos conectados */}
      <div className="conexions-list">
        {conexions.map(c => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''}`}
            style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            onClick={() => handleConexionClick(c)}
          >
            {/* Somente mostra QR Code se o aparelho estiver "conectado" no UI (independente do Bluetooth real) */}
            {c.connected && (
              <div className="qrcode-top-left">
                <button
                  className="qrcode-button"
                  onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }}
                  type="button"
                >
                  <img src={imgQrcode} alt="QR Code" className="qrCodeAparelhoConectado" />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
            </div>
            <div className="actions-overlay">
              <button
                className="remove-button"
                onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }}
                type="button"
              >
                ×
              </button>
              <button
                className="edit-button"
                onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                type="button"
                disabled={!c.connected} // Desabilita edição se o aparelho estiver "desligado" no UI
              >
                <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
              </button>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={c.connected}
                  // Chama a nova função toggleConnection com o ID e o estado atual
                  onChange={(e) => { e.stopPropagation(); toggleConnection(c.id, c.connected); }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalhes aparelho */}
      {selectedConexion && (
        <div className="modal-overlay" onClick={() => setSelectedConexion(null)}>
          <div className="conexion-details-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedConexion.text}</h3>
            <img
              src={selectedConexion.icon}
              alt={selectedConexion.text}
              style={{ width: 80, height: 80 }}
            />
            <p>
              <strong>Status:</strong> {selectedConexion.connected ? 'Conectado' : 'Desativado'}
            </p>
            {selectedConexion.bluetoothDevice && (
              <p>
                <strong>ID Bluetooth:</strong> {selectedConexion.bluetoothDevice.id}
              </p>
            )}
            <p>
              <strong>Data de conexão:</strong> {formatDate(selectedConexion.connectedDate)}
            </p>
            <p>
              <strong>Duração da conexão:</strong> {getConnectionDuration(selectedConexion.connectedDate)}
            </p>
            <button
              className="close-button-styled"
              onClick={() => setSelectedConexion(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmação remoção */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={handleCancelRemove}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <p>Tem certeza que deseja remover este aparelho?</p>
            <div className="confirmation-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
              <button onClick={handleCancelRemove} className="cancel-button">Não</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal aviso limite aparelhos */}
      {showLimitWarning && (
        <div className="modal-overlay" onClick={() => setShowLimitWarning(false)}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <p>Você atingiu o limite máximo de aparelhos conectados ({DEVICE_LIMIT}).</p>
            <button onClick={() => setShowLimitWarning(false)} className="confirm-button">OK</button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {visibleQRCode && (
        <div className="modal-overlay" onClick={() => setVisibleQRCode(null)}>
          <div className="qr-code-modal" onClick={e => e.stopPropagation()}>
            <QRCodeCanvas
              value={`${siteBaseURL}/aparelho/${encodeURIComponent(visibleQRCode.text)}`}
              size={256}
              level="H"
              includeMargin={true}
            />
            <button className="close-button" onClick={() => setVisibleQRCode(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;