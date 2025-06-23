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

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  const availableIcons = [
    { name: 'TV', src: tvIcon },
    { name: 'Ar Condicionado', src: airConditionerIcon },
    { name: 'Lâmpada', src: lampIcon },
    { name: 'Airfry', src: airfry },
    { name: 'Carregador', src: carregador }
  ];

  // ✅ Adiciona aparelho automaticamente se acessar via URL com parâmetros
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const aparelhoParaAdicionar = params.get('add');
    const tipo = params.get('type') || aparelhoParaAdicionar;

    if (aparelhoParaAdicionar && tipo) {
      console.log('[QR CODE] Adicionando via URL:', aparelhoParaAdicionar);

      const iconMap = {
        'TV': tvIcon,
        'Ar Condicionado': airConditionerIcon,
        'Airfry': airfry,
        'Lâmpada': lampIcon,
        'Carregador': carregador
      };

      const icon = iconMap[tipo] || lampIcon;

      onConnectDevice(aparelhoParaAdicionar, tipo, icon, availableColors[0]);

      window.history.replaceState({}, document.title, window.location.pathname); // Limpa os parâmetros da URL
    }
  }, [location.search]);

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
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

    if (conexions.some((c) => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}" 😅`);
      return;
    }

    if (editingId !== null) {
      setConexions(prevConexions => prevConexions.map(c =>
        c.id === editingId
          ? { ...newConexion, id: c.id, connectedDate: c.connectedDate || new Date().toISOString() }
          : c
      ));
    } else {
      onConnectDevice(
        newConexion.text,
        newConexion.text,
        newConexion.icon,
        newConexion.backgroundColor
      );
    }

    setShowAddForm(false);
  };

  const removeConexion = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemoveDevice(id);
      setRemovingId(null);
      setSelectedConexion(null);
    }, 300);
  };

  const handleEditClick = (conexionToEdit) => {
    if (conexionToEdit.connected) {
      setNewConexion({
        text: conexionToEdit.text,
        icon: conexionToEdit.icon,
        backgroundColor: conexionToEdit.backgroundColor || availableColors[0],
        connected: conexionToEdit.connected !== undefined ? conexionToEdit.connected : true,
        connectedDate: conexionToEdit.connectedDate || new Date().toISOString()
      });
      setActiveIcon(conexionToEdit.icon);
      setActiveColor(conexionToEdit.backgroundColor || availableColors[0]);
      setShowAddForm(true);
      setEditingId(conexionToEdit.id);
      setErrorMessage('');
      setSelectedConexion(null);
    }
  };

  const toggleConnection = (id) => {
    onToggleConnection(id);
    const conexionBeingToggled = conexions.find(c => c.id === id);
    if (selectedConexion && selectedConexion.id === id && conexionBeingToggled.connected) {
      setSelectedConexion(null);
    }
  };

  const handleConexionClick = (conexion) => {
    if (conexion.connected) {
      setSelectedConexion(conexion);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionDuration = (connectedDateString) => {
    const connected = new Date(connectedDateString);
    const now = new Date();
    const diffMs = now - connected;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} dia(s) e ${diffHours % 24} hora(s)`;
    if (diffHours > 0) return `${diffHours} hora(s) e ${diffMinutes % 60} minuto(s)`;
    if (diffMinutes > 0) return `${diffMinutes} minuto(s) e ${diffSeconds % 60} segundo(s)`;
    return `${diffSeconds} segundo(s)`;
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>
      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId !== null ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
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
                    onClick={() => {
                      setNewConexion({ ...newConexion, icon: icon.src });
                      setActiveIcon(icon.src);
                    }}
                    title={icon.name}
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
                    onClick={() => {
                      setNewConexion({ ...newConexion, backgroundColor: color });
                      setActiveColor(color);
                    }}
                    title={color}
                  ></button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button onClick={saveConexion} className="save-button-styled">
                {editingId !== null ? 'Salvar Edição' : 'Salvar'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((c) => {
          const isRemoving = removingId === c.id;

          return (
            <div
              key={c.id}
              className={`retanguloAdicionado ${isRemoving ? 'exiting' : ''}`}
              style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
              onClick={() => handleConexionClick(c)}
            >
              {c.connected && (
                <div className="qrcode-top-left">
                  <button
                    className="qrcode-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleQRCode(c);
                    }}
                    title="Gerar QR Code"
                  >
                    <img src={imgQrcode} alt="QR Code" className='qrCodeAparelhoConectado' />
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
                  title="Remover"
                  disabled={!c.connected}
                  style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                >X</button>

                <button
                  className="edit-button"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                  title="Editar"
                  disabled={!c.connected}
                  style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                >
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
          );
        })}
        <div style={{ height: '60px' }}></div>
      </div>

      {visibleQRCode && (
        <div className="qrcode-overlay">
          <button className="close-qrcode" onClick={() => setVisibleQRCode(null)}>X</button>
          <QRCodeCanvas
            value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(visibleQRCode.text)}&type=${encodeURIComponent(visibleQRCode.text)}`}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            imageSettings={{
              src: visibleQRCode.icon,
              height: 40,
              width: 40,
              excavate: true,
            }}
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
            <p><strong>ID do aparelho:</strong> <code>{selectedConexion.id}</code></p>
            <button onClick={() => setSelectedConexion(null)} className="close-button-styled">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;
