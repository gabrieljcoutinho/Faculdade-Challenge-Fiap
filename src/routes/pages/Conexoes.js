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

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
// IMPORTANT: This should be your actual site's base URL for the QR code to work correctly
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString(), connectionCount: 0 }); // Added connectionCount
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  const availableIcons = [
    { name: 'tv', src: tvIcon },
    { name: 'arcondicionado', src: airConditionerIcon },
    { name: 'lampada', src: lampIcon },
    { name: 'airfry', src: airfry },
    { name: 'carregador', src: carregador }
  ];

  // Maps icon string names to their image sources
  const iconMap = {
    tv: tvIcon,
    arcondicionado: airConditionerIcon,
    airfry: airfry,
    lampada: lampIcon,
    carregador: carregador
  };

  // Helper to get the icon key (string name) from its source URL
  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  // Effect to handle incoming QR code connections
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const deviceId = params.get('deviceId'); // Expecting a deviceId from QR code

    if (deviceId) {
      const connectViaQRCode = async () => {
        try {
          // --- Backend Call: Register new connection ---
          // This simulates sending a request to your backend to register a new connection
          // You would replace '/api/connect-device' with your actual backend endpoint
          // and adjust the body to match your backend's expectations.
          const connectResponse = await fetch('/api/connect-device', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId: deviceId }),
          });

          if (!connectResponse.ok) {
            throw new Error('Failed to register connection on backend.');
          }

          // --- Backend Call: Get updated device details including connection count ---
          // After registering the connection, fetch the latest data for this device
          // including its current connection count.
          const detailsResponse = await fetch(`/api/get-device-details/${deviceId}`);
          if (!detailsResponse.ok) {
            throw new Error('Failed to fetch device details.');
          }
          const deviceData = await detailsResponse.json(); // This should contain name, iconKey, backgroundColor, and connectionCount

          setConexions(prevConexions => {
            const existingConexionIndex = prevConexions.findIndex(c => c.id === deviceData.id);

            if (existingConexionIndex > -1) {
              // If the device already exists in the list, update its details
              const updatedConexions = [...prevConexions];
              updatedConexions[existingConexionIndex] = {
                ...updatedConexions[existingConexionIndex],
                text: deviceData.name, // Update name if it changed
                icon: iconMap[deviceData.iconKey], // Update icon if it changed
                backgroundColor: deviceData.backgroundColor || availableColors[0],
                connected: true, // Mark as connected
                connectedDate: deviceData.connectedDate || new Date().toISOString(), // Use backend date or current
                connectionCount: deviceData.connectionCount // Update with actual count from backend
              };
              return updatedConexions;
            } else {
              // If it's a new device being connected (e.g., first time seen by this user)
              // Add it to the list
              return [...prevConexions, {
                id: deviceData.id,
                text: deviceData.name,
                icon: iconMap[deviceData.iconKey],
                backgroundColor: deviceData.backgroundColor || availableColors[0],
                connected: true,
                connectedDate: deviceData.connectedDate || new Date().toISOString(),
                connectionCount: deviceData.connectionCount,
              }];
            }
          });

        } catch (error) {
          console.error('Erro ao conectar aparelho via QR Code:', error);
          // You might want to show an error message to the user here
        } finally {
          // Clean up the URL parameters
          window.history.replaceState({}, document.title, location.pathname);
        }
      };
      connectViaQRCode();
    }
  }, [location.search, setConexions]); // Dependencies: re-run if URL search params or setConexions changes

  const handleAddClick = () => {
    setShowAddForm(true);
    // Reset form fields and set initial connectionCount to 1 (for the device being added by the user)
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString(), connectionCount: 1 });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null);
    setErrorMessage('');
    setSelectedConexion(null);
  };

  const saveConexion = () => {
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Dê um nome e selecione um ícone para o aparelho 😊');
      return;
    }

    // Check for duplicate names (case-insensitive) excluding the currently edited item
    if (conexions.some((c) => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}" 😅`);
      return;
    }

    if (editingId !== null) {
      // If editing, update existing conexion
      setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate, connectionCount: c.connectionCount } : c));
      // TODO: Call backend API to update device details (name, icon, color)
    } else {
      // If adding new, call onConnectDevice (which should also interact with your backend)
      onConnectDevice(newConexion.text, newConexion.text, newConexion.icon, newConexion.backgroundColor);
      // The onConnectDevice in the parent component should assign a unique ID and initialize connectionCount to 1
    }

    setShowAddForm(false);
  };

  const removeConexion = (id) => {
    setConexionToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete);
      setTimeout(() => {
        onRemoveDevice(conexionToDelete); // This should also inform your backend to decrement/remove device
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
      // Preserve connectionCount when editing
      setNewConexion({ text: c.text, icon: c.icon, backgroundColor: c.backgroundColor || availableColors[0], connected: c.connected, connectedDate: c.connectedDate, connectionCount: c.connectionCount });
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setShowAddForm(true);
      setEditingId(c.id);
      setErrorMessage('');
      setSelectedConexion(null);
    }
  };

  const toggleConnection = (id) => {
    onToggleConnection(id); // This should also inform your backend about the connection status change
    const c = conexions.find(c => c.id === id);
    if (selectedConexion && selectedConexion.id === id && c.connected) setSelectedConexion(null);
  };

  const handleConexionClick = (c) => {
    if (c.connected) setSelectedConexion(c);
  };

  const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getConnectionDuration = (connectedDateString) => {
    const connected = new Date(connectedDateString);
    const now = new Date();
    const diff = now - connected;
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);

    if (d > 0) return `${d} dia(s) e ${h % 24} hora(s)`;
    if (h > 0) return `${h} hora(s) e ${m % 60} minuto(s)`;
    if (m > 0) return `${m} minuto(s) e ${s % 60} segundo(s)`;
    return `${s} segundo(s)`;
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>
      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {/* IMAGEM quando não há conexões */}
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
            <input type="text" placeholder="Nome do Aparelho" value={newConexion.text} onChange={(e) => setNewConexion({ ...newConexion, text: e.target.value })} />
            <div className="icon-picker-styled">
              <label>Escolha o ícone:</label>
              <div className="icons">
                {availableIcons.map((icon) => (
                  <button key={icon.name} className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`} onClick={() => { setNewConexion({ ...newConexion, icon: icon.src }); setActiveIcon(icon.src); }}>
                    <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="color-picker-styled">
              <label className='tipoDoFundoConexao'>Escolha a cor de fundo:</label>
              <div className="colors">
                {availableColors.map((color) => (
                  <button key={color} className={`color-option ${activeColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }}></button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button onClick={saveConexion} className="save-button-styled">{editingId ? 'Salvar Edição' : 'Salvar'}</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((c) => (
          <div key={c.id} className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''}`} style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }} onClick={() => handleConexionClick(c)}>
            {c.connected && (
              <div className="qrcode-top-left">
                <button className="qrcode-button" onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }}>
                  <img src={imgQrcode} alt="QR Code" className='qrCodeAparelhoConectado' />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
              {/* Display connection count if available and connected */}
              {c.connected && typeof c.connectionCount === 'number' && (
                <p className="connection-count-text">
                  {c.connectionCount} {c.connectionCount === 1 ? 'pessoa' : 'pessoas'} conectada{c.connectionCount === 1 ? '' : 's'}
                </p>
              )}
            </div>
            <div className="actions-overlay">
              <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }} disabled={!c.connected}>X</button>
              <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }} disabled={!c.connected}>
                <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
              </button>
              <div className="switch-container" onClick={(e) => e.stopPropagation()}>
                <label className="switch">
                  <input type="checkbox" checked={c.connected} onChange={() => toggleConnection(c.id)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: '60px' }}></div>
      </div>

      {visibleQRCode && (
        <div className="qrcode-overlay">
          <button className="close-qrcode" onClick={() => setVisibleQRCode(null)}>X</button>
          {/* QR Code value now sends the device's unique ID */}
          <QRCodeCanvas
            value={`${siteBaseURL}/conexoes?deviceId=${encodeURIComponent(visibleQRCode.id)}`}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>
      )}

      {selectedConexion && (
        <div className="modal-overlay">
          <div className="conexion-details-modal">
            <h2>Detalhes do Aparelho</h2>
            <img src={selectedConexion.icon} alt={selectedConexion.text} style={{ width: '60px', height: '60px' }} />
            <h3>{selectedConexion.text}</h3>
            <p><strong>Conectado:</strong> {formatDate(selectedConexion.connectedDate)}</p>
            <p><strong>Tempo conectado:</strong> {getConnectionDuration(selectedConexion.connectedDate)}</p>
            {/* Display connection count in details modal */}
            {typeof selectedConexion.connectionCount === 'number' && (
              <p><strong>Pessoas conectadas:</strong> {selectedConexion.connectionCount}</p>
            )}
            <p><strong>ID do aparelho:</strong> <code>{selectedConexion.id}</code></p>
            <button onClick={() => setSelectedConexion(null)} className="close-button-styled">Fechar</button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h2>Excluir este aparelho?</h2>
            <p>Você tem certeza que deseja excluir "{conexions.find(c => c.id === conexionToDelete)?.text}"?</p>
            <div className="dialog-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
              <button onClick={handleCancelRemove} className="cancel-button-styled">Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;