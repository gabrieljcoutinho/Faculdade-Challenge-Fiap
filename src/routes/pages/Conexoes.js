import React, { useState, useEffect } from 'react';
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

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  // Estados de UI
  const [showAddForm, setShowAddForm] = useState(false);
  const [modoManual, setModoManual] = useState(false); // Novo estado para controle do modo manual
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

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

  // Handle params URL para adicionar direto
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
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });

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

        onConnectDevice(deviceName, deviceName, guessedIcon, availableColors[0]);
        setShowAddForm(false);
      } else {
        setErrorMessage('Nenhum aparelho Bluetooth selecionado.');
      }
    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      if (error.name === 'NotFoundError') setErrorMessage('Nenhum aparelho Bluetooth encontrado ou selecionado.');
      else if (error.name === 'NotAllowedError') setErrorMessage('Permissão de Bluetooth negada.');
      else if (error.message.includes('User cancelled')) setErrorMessage('Seleção de aparelho Bluetooth cancelada.');
      else setErrorMessage('Falha na conexão Bluetooth. Tente novamente.');
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

    setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate } : c));
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
      setTimeout(() => {
        onRemoveDevice(conexionToDelete);
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
    if (c.connected) {
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
    }
  };

  // Alternar status conexão (on/off)
  const toggleConnection = (id) => {
    onToggleConnection(id);
    const c = conexions.find(device => device.id === id);
    if (selectedConexion && selectedConexion.id === id && c.connected) {
      setSelectedConexion(null);
    }
  };

  // Abrir modal detalhes do dispositivo
  const handleConexionClick = (c) => {
    if (c.connected) {
      setSelectedConexion(c);
    }
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
                      const newDevice = {
                        id: Date.now().toString(),
                        text: newConexion.text,
                        icon: newConexion.icon,
                        backgroundColor: newConexion.backgroundColor,
                        connected: true,
                        connectedDate: new Date().toISOString()
                      };
                      setConexions(prev => [...prev, newDevice]);
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
                disabled={!c.connected}
              >
                <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
              </button>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={c.connected}
                  onChange={(e) => { e.stopPropagation(); toggleConnection(c.id); }}
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
          <div className="detalhes-aparelho" onClick={e => e.stopPropagation()}>
            <h3>{selectedConexion.text}</h3>
            <img src={selectedConexion.icon} alt={selectedConexion.text} style={{ width: 80, height: 80 }} />
            <p><strong>Cor de fundo:</strong> <span style={{ backgroundColor: selectedConexion.backgroundColor, padding: '0 10px' }}>{selectedConexion.backgroundColor}</span></p>
            <p><strong>Data de conexão:</strong> {formatDate(selectedConexion.connectedDate)}</p>
            <p><strong>Duração da conexão:</strong> {getConnectionDuration(selectedConexion.connectedDate)}</p>
            <button className="close-button" onClick={() => setSelectedConexion(null)}>Fechar</button>
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
