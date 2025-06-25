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
import '../../CSS/Conexao/imgNaoConectado.css'
import '../../CSS/Conexao/mensagemRemoverAparelho.css'
import '../../CSS/Conexao/mensagemMuitosAprelhosConectadosAoMesmoTempo.css'
import '../../CSS/Conexao/temperaturaArCondicionado.css' // Certifique-se de que este arquivo existe e está sendo importado

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png'; // <-- Imagem que aparece quando não há conexões

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  // Adicionado 'temperature' ao estado inicial de newConexion
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString(), temperature: null });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  // Novo estado para controlar a temperatura dos aparelhos (específico para AC)
  const [acTemperatures, setAcTemperatures] = useState({});

  // New state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [conexionToDelete, setConexionToDelete] = useState(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false); // New state for the warning

  const availableIcons = [
    { name: 'tv', src: tvIcon },
    { name: 'arcondicionado', src: airConditionerIcon },
    { name: 'lampada', src: lampIcon },
    { name: 'airfry', src: airfry },
    { name: 'carregador', src: carregador }
  ];

  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  const iconMap = {
    tv: tvIcon,
    arcondicionado: airConditionerIcon,
    airfry: airfry,
    lampada: lampIcon,
    carregador: carregador
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('add');
    const iconKey = params.get('icon');

    if (nome && iconKey && iconMap[iconKey]) {
      // Check for device limit before connecting
      if (conexions.length >= 5) {
        setShowLimitWarning(true);
      }
      // Passa a temperatura inicial para o ar-condicionado (ex: 22°C)
      const initialTemperature = iconMap[iconKey] === airConditionerIcon ? 22 : null;
      onConnectDevice(nome, nome, iconMap[iconKey], availableColors[0], initialTemperature);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions.length]); // Added conexions.length to dependency array

  // Atualiza acTemperatures quando conexions muda
  useEffect(() => {
    const newAcTemperatures = {};
    conexions.forEach(c => {
      if (c.icon === airConditionerIcon && c.temperature !== undefined) {
        newAcTemperatures[c.id] = c.temperature;
      }
    });
    setAcTemperatures(newAcTemperatures);
  }, [conexions]);

  const handleAddClick = () => {
    setShowAddForm(true);
    // Resetar newConexion com temperatura nula por padrão
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString(), temperature: null });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false); // Reset warning when opening add form
  };

  const saveConexion = () => {
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Dê um nome e selecione um ícone para o aparelho 😊');
      return;
    }

    if (conexions.some((c) => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}" 😅`);
      return;
    }

    if (editingId !== null) {
      // Se estiver editando, mantém a temperatura existente ou define null se não for AC
      const updatedTemperature = newConexion.icon === airConditionerIcon ? (newConexion.temperature || acTemperatures[editingId] || 22) : null;
      setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate, temperature: updatedTemperature } : c));
    } else {
      // Check for device limit before connecting
      if (conexions.length >= 5) {
        setShowLimitWarning(true);
        return; // Impede a adição se o limite for atingido
      }
      // Define a temperatura inicial para o ar-condicionado (padrão: 22)
      const initialTemperature = newConexion.icon === airConditionerIcon ? 22 : null;
      onConnectDevice(newConexion.text, newConexion.text, newConexion.icon, newConexion.backgroundColor, initialTemperature);
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
      // Ao editar, define a temperatura atual do AC se existir
      setNewConexion({ text: c.text, icon: c.icon, backgroundColor: c.backgroundColor || availableColors[0], connected: c.connected, connectedDate: c.connectedDate, temperature: c.temperature });
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setShowAddForm(true);
      setEditingId(c.id);
      setErrorMessage('');
      setSelectedConexion(null);
      setShowLimitWarning(false); // Reset warning when opening edit form
    }
  };

  const toggleConnection = (id) => {
    onToggleConnection(id);
    const c = conexions.find(c => c.id === id);
    if (selectedConexion && selectedConexion.id === id && c.connected) setSelectedConexion(null);
  };

  const handleConexionClick = (c) => {
    if (c.connected) setSelectedConexion(c);
  };

  // Nova função para manipular a mudança de temperatura
  const handleTemperatureChange = (deviceId, newTemperature) => {
    setAcTemperatures(prev => ({
      ...prev,
      [deviceId]: newTemperature
    }));
    // Atualiza a conexão no estado principal de `conexions`
    setConexions(prevConexions =>
      prevConexions.map(conn =>
        conn.id === deviceId
          ? { ...conn, temperature: newTemperature }
          : conn
      )
    );
    // Se desejar, adicione aqui uma chamada para uma função externa
    // (ex: onUpdateDeviceTemperature(deviceId, newTemperature))
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
                  <button key={icon.name} className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`} onClick={() => { setNewConexion({ ...newConexion, icon: icon.src, temperature: icon.src === airConditionerIcon ? (newConexion.temperature || 22) : null }); setActiveIcon(icon.src); }}>
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
              {/* Exibir temperatura se for um ar-condicionado e estiver conectado */}
              {c.icon === airConditionerIcon && c.connected && c.temperature !== undefined && (
                // AQUI É A LINHA ALTERADA para melhorar o texto
                <span className="temperature-display">
                  Temp: <span className="temperature-value">{c.temperature}°C</span>
                </span>
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
          <QRCodeCanvas
            value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(visibleQRCode.text)}&icon=${encodeURIComponent(getIconKeyBySrc(visibleQRCode.icon))}`}
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
            {selectedConexion.icon === airConditionerIcon && selectedConexion.connected && (
              <div className="temperature-control">
                <h4>Temperatura:</h4>
                <input
                  type="range"
                  min="16" // Exemplo de temperatura mínima
                  max="30" // Exemplo de temperatura máxima
                  value={acTemperatures[selectedConexion.id] || 22} // Usa a temperatura do estado ou 22 como padrão
                  onChange={(e) => handleTemperatureChange(selectedConexion.id, parseInt(e.target.value))}
                />
                <span>{acTemperatures[selectedConexion.id] || 22}°C</span>
              </div>
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

      {/* Device Limit Warning Dialog */}
      {showLimitWarning && (
        <div className="modal-overlay">
          <div className="warning-dialog">
            <h2>Aviso!</h2>
            <p>Você tem MUITOS aparelhos conectados. Considere desconectar alguns para um melhor gerenciamento.</p>
            <button onClick={() => setShowLimitWarning(false)} className="close-button-styled">Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;