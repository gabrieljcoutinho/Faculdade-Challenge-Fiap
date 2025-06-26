import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';

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

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";
const DEVICE_LIMIT = 5;

const availableIcons = [
  { name: 'tv', src: tvIcon },
  { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon },
  { name: 'airfry', src: airfry },
  { name: 'carregador', src: carregador }
];

const iconMap = availableIcons.reduce((acc, icon) => {
  acc[icon.name] = icon.src;
  return acc;
}, {});

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  const [newConexion, setNewConexion] = useState({
    text: '',
    icon: '',
    backgroundColor: availableColors[0],
    connected: true,
    connectedDate: new Date().toISOString(),
    device: null,             // Aqui armazenaremos o BluetoothDevice real
    gattServer: null,         // conexão GATT para enviar comandos
    powerCharacteristic: null // characteristic para ligar/desligar
  });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('add');
    const iconKey = params.get('icon');

    if (nome && iconKey && iconMap[iconKey]) {
      if (conexions.length >= DEVICE_LIMIT) {
        setShowLimitWarning(true);
      } else {
        onConnectDevice(nome, nome, iconMap[iconKey], availableColors[0]);
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions.length]);

  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  const handleAddClick = () => {
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString(), device: null, gattServer: null, powerCharacteristic: null });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false);
    setShowAddForm(true);
    setIsSearchingBluetooth(false);
  };

  // Função para conectar e obter characteristic para controle (exemplo)
  const connectToDeviceAndGetPowerCharacteristic = async (device) => {
    try {
      const server = await device.gatt.connect();
      // Exemplo: usar serviço 'device_information' ou outro correto
      // Aqui você deve usar o UUID correto do seu aparelho
      const service = await server.getPrimaryService('battery_service'); // Troque pelo serviço real do seu dispositivo
      // Característica hipotética para ligar/desligar
      const characteristic = await service.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb'); // Exemplo, troque pelo UUID real
      return { server, characteristic };
    } catch (error) {
      console.error('Erro ao conectar e obter característica:', error);
      throw error;
    }
  };

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
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      if (device) {
        const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';

        let guessedIcon = lampIcon;
        if (deviceName.toLowerCase().includes('tv')) guessedIcon = tvIcon;
        else if (deviceName.toLowerCase().includes('ar')) guessedIcon = airConditionerIcon;
        else if (deviceName.toLowerCase().includes('carregador')) guessedIcon = carregador;
        else if (deviceName.toLowerCase().includes('airfry')) guessedIcon = airfry;

        if (conexions.some(c => c.text.toLowerCase() === deviceName.toLowerCase())) {
          setErrorMessage(`Já existe um aparelho chamado "${deviceName}".`);
          setIsSearchingBluetooth(false);
          return;
        }

        // Aqui conectamos e pegamos characteristic para controle
        const { server, characteristic } = await connectToDeviceAndGetPowerCharacteristic(device);

        // Criamos o objeto da conexão incluindo device real e characteristic
        const newDevice = {
          id: Date.now().toString(),
          text: deviceName,
          icon: guessedIcon,
          backgroundColor: availableColors[0],
          connected: true,
          connectedDate: new Date().toISOString(),
          device,
          gattServer: server,
          powerCharacteristic: characteristic,
        };

        setConexions(prev => [...prev, newDevice]);
        setShowAddForm(false);
      } else {
        setErrorMessage('Nenhum aparelho Bluetooth selecionado.');
      }
    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      if (error.name === 'NotFoundError') setErrorMessage('Nenhum aparelho foi selecionado.');
      else if (error.name === 'NotAllowedError') setErrorMessage('Permissão de Bluetooth negada.');
      else if (error.message.includes('User cancelled')) setErrorMessage('Seleção cancelada.');
      else setErrorMessage('Falha na conexão Bluetooth. Tente novamente.');
    } finally {
      setIsSearchingBluetooth(false);
    }
  };

  // Função para ligar/desligar o dispositivo via Bluetooth
  const sendPowerCommand = async (deviceObj, ligar) => {
    if (!deviceObj || !deviceObj.powerCharacteristic) {
      console.warn('Dispositivo não tem característica para controle.');
      return;
    }
    try {
      // Exemplo: ligar = 1, desligar = 0
      const value = new Uint8Array([ligar ? 1 : 0]);
      await deviceObj.powerCharacteristic.writeValue(value);
      console.log(`Comando para ${ligar ? 'ligar' : 'desligar'} enviado com sucesso.`);
    } catch (error) {
      console.error('Erro ao enviar comando power:', error);
      setErrorMessage('Erro ao enviar comando para o dispositivo.');
    }
  };

  const saveEditedConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) {
      setErrorMessage('Informe nome e ícone do aparelho.');
      return;
    }

    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com nome "${newConexion.text}".`);
      return;
    }

    setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate } : c));
    setShowAddForm(false);
    setErrorMessage('');
  };

  const removeConexion = (id) => {
    setConexionToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete);
      setTimeout(() => {
        onRemoveDevice(conexionToDelete);
        setRemovingId(null);
        setSelectedConexion(null);
        setConexionToDelete(null);
        setShowConfirmDialog(false);
      }, 300);
    }
  };

  const handleCancelRemove = () => {
    setConexionToDelete(null);
    setShowConfirmDialog(false);
  };

  const handleEditClick = (c) => {
    if (c.connected) {
      setNewConexion({ ...c }); // inclui device, gattServer, powerCharacteristic
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setEditingId(c.id);
      setErrorMessage('');
      setSelectedConexion(null);
      setShowLimitWarning(false);
      setShowAddForm(true);
      setIsSearchingBluetooth(false);
    }
  };

  const toggleConnection = async (id) => {
    const c = conexions.find(device => device.id === id);
    if (!c) return;

    const newConnectedState = !c.connected;

    // Tentar enviar comando via Bluetooth para ligar/desligar
    if (c.gattServer && c.gattServer.connected) {
      try {
        await sendPowerCommand(c, newConnectedState);
      } catch {
        // Caso erro, podemos desconectar ou tentar reconectar
      }
    } else {
      // Se não estiver conectado, tenta reconectar para enviar comando
      if (c.device) {
        try {
          const server = await c.device.gatt.connect();
          c.gattServer = server;
          // Re-obtenha characteristic se quiser mais robustez
          // ...
          await sendPowerCommand(c, newConnectedState);
        } catch (error) {
          setErrorMessage('Não foi possível conectar ao dispositivo para alterar estado.');
          return;
        }
      }
    }

    // Atualiza o estado local (ligado/desligado)
    onToggleConnection(id);

    if (selectedConexion && selectedConexion.id === id && !newConnectedState) {
      setSelectedConexion(null);
    }
  };

  const handleConexionClick = (c) => {
    if (c.connected) setSelectedConexion(c);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {editingId ? (
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
                    {availableIcons.map((icon) => (
                      <button
                        key={icon.name}
                        className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                        onClick={() => { setNewConexion({ ...newConexion, icon: icon.src }); setActiveIcon(icon.src); }}
                      >
                        <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className='tipoDoFundoConexao'>Escolha a cor de fundo:</label>
                  <div className="colors">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        className={`color-option ${activeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }}
                      ></button>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={saveEditedConexion} className="save-button-styled">Salvar Edição</button>
                  <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <p>Clique no botão abaixo para procurar e conectar aparelhos Bluetooth próximos:</p>
                <button
                  onClick={handleSearchAndConnectBluetooth}
                  className="add-button-styled"
                  disabled={isSearchingBluetooth}
                >
                  {isSearchingBluetooth ? 'Procurando Aparelhos...' : 'Procurar Aparelhos Bluetooth'}
                </button>
                {isSearchingBluetooth && <p className="connecting-message">Aguarde, selecione o aparelho na janela que abriu.</p>}
                <div className="form-actions">
                  <button onClick={() => setShowAddForm(false)} className="cancel-button-styled" disabled={isSearchingBluetooth}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((c) => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''}`}
            style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            onClick={() => handleConexionClick(c)}
          >
            {c.connected && (
              <div className="qrcode-top-left">
                <button className="qrcode-button" onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }}>
                  <img src={imgQrcode} alt="QR Code" className='qrCodeAparelhoConectado' />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} style={{ width: '50px', height: '50px' }} />
              <span className="device-name">{c.text}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={c.connected}
                onChange={() => toggleConnection(c.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="slider round"></span>
            </label>
            <button
              className="edit-button"
              onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
              disabled={!c.connected}
              title="Editar aparelho"
            >
              <img src={editIcon} alt="Editar" />
            </button>
            <button
              className="remove-button"
              onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }}
              title="Remover aparelho"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {visibleQRCode && (
        <div className="qr-code-modal" onClick={() => setVisibleQRCode(null)}>
          <div className="qr-code-content" onClick={(e) => e.stopPropagation()}>
            <QRCodeCanvas value={`${siteBaseURL}/Conexao?id=${visibleQRCode.id}`} size={256} />
            <button onClick={() => setVisibleQRCode(null)} className="close-qr-button">Fechar</button>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p>Tem certeza que deseja remover este aparelho?</p>
            <div className="confirm-buttons">
              <button onClick={handleConfirmRemove} className="confirm-yes">Sim</button>
              <button onClick={handleCancelRemove} className="confirm-no">Não</button>
            </div>
          </div>
        </div>
      )}

      {showLimitWarning && (
        <div className="limit-warning">
          <p>Você atingiu o limite máximo de aparelhos conectados ({DEVICE_LIMIT}). Remova algum antes de adicionar outro.</p>
          <button onClick={() => setShowLimitWarning(false)}>Fechar</button>
        </div>
      )}
    </div>
  );
};

export default Conexoes;
