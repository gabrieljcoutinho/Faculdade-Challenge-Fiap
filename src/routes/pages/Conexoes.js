import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';

// Importa todos os arquivos CSS (considerando que são essenciais para o estilo)
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
import '../../CSS/Conexao/btnConectadoEnaoConectado.css'

// Importa imagens
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png';
import bluetoothIcon from '../../imgs/bluetooth.png';
import manual from '../../imgs/manual.png';

import { tituloPrincipal, adicionarAparelho, escolherIcone, escolherCorDefundo, btnBluetooth,
  procurarAparelhosBluetooth, adicicionarAparelhoManualmente, esperaMenuBluetoothAbrir, mensagemAparelhoDesativado,
detalhesaparelhoAmpliados, mensagemExcluirAparelho, btnEditar, btnRemover, tempoAparelhoConectado, duracaoConecxao
} from '../../constants/Conexao/index.js';

// Constantes
const availableColors = [
  '#FFFFF0', // ivory
  '#FFFFE0', // lightYellow
  '#E0FFFF', // lightCyan
  '#F0FFF0', // honeydew
  '#F5FFFA', // mintCream
  '#FFFACD', // lemonChiffon
  '#F0FFFF', // azure
  '#FFFAF0', // floralWhite
  '#F8F8FF'  // ghostWhite
];

const siteBaseURL = "https://challenge-fiap-nine.vercel.app";

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

  // UI States
  const [showAddForm, setShowAddForm] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);
  // NEW STATE: To control which list is active
  const [activeList, setActiveList] = useState('connected'); // 'connected' or 'disconnected'

  // Form data states
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: '' });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  // Drag and Drop States
  const dragItem = useRef(null); // Referência ao índice do item arrastado
  const dragOverItem = useRef(null); // Referência ao índice do item sendo arrastado sobre
  const touchStartTimer = useRef(null); // Timer para detecção de toque longo
  const [isDragging, setIsDragging] = useState(false); // Para indicar se o arrasto está ativo
  const currentDragElement = useRef(null); // Referência ao elemento DOM sendo arrastado atualmente


  // Helper: Get icon key by its source
  const getIconKeyBySrc = (src) => availableIcons.find(icon => icon.src === src)?.name || '';

  // EFFECT HOOK: Handles URL parameters for automatic device connection via QR code scan
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const [nome, iconKey, bgColor] = [params.get('add'), params.get('icon'), params.get('bgColor')];

    if (nome && iconKey) {
      const iconSrc = iconMap[iconKey];
      const actualBgColor = availableColors.includes(bgColor) ? bgColor : availableColors[0];

      if (iconSrc) {
        if (conexions.some(c => c.text.toLowerCase() === nome.toLowerCase())) {
          setErrorMessage(`Já existe um aparelho chamado "${nome}".`);
        } else {
          onConnectDevice(nome, nome, iconSrc, actualBgColor);
        }
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions]);

  // Centralized close function for all modals/forms
  const closeAllModals = () => {
    setShowAddForm(false); setModoManual(false); setErrorMessage(''); setIsSearchingBluetooth(false);
    setShowConfirmDialog(false); setVisibleQRCode(null); setSelectedConexion(null);
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
    setActiveIcon(null); setActiveColor(availableColors[0]);
    if (touchStartTimer.current) {
        clearTimeout(touchStartTimer.current);
        touchStartTimer.current = null;
    }
    setIsDragging(false);
    if (currentDragElement.current) {
        currentDragElement.current.classList.remove('dragging');
        currentDragElement.current = null;
    }
    // Remove all 'drag-over' classes from elements that might still have them
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  // Open add device form (Bluetooth mode by default)
  const handleAddClick = () => {
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
    setActiveIcon(null); setActiveColor(availableColors[0]); setEditingId(null); setErrorMessage('');
    setSelectedConexion(null); setShowAddForm(true); setIsSearchingBluetooth(false); setModoManual(false);
  };

  // Open manual add form
  const abrirModoManual = () => {
    setModoManual(true);
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
    setActiveIcon(null); setActiveColor(availableColors[0]); setErrorMessage(''); setEditingId(null); setIsSearchingBluetooth(false);
  };

  // Search and connect Bluetooth devices
  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) { setErrorMessage('Seu navegador não suporta Web Bluetooth. Use Chrome, Edge ou Opera.'); return; }

    setIsSearchingBluetooth(true); setErrorMessage('');
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      if (device) {
        const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';
        let guessedIcon = lampIcon;
        const name = deviceName.toLowerCase();

        if (name.includes('tv') || name.includes('monitor')) guessedIcon = tvIcon;
        else if (name.includes('ar') || name.includes('condicionado')) guessedIcon = airConditionerIcon;
        else if (name.includes('lamp') || name.includes('lâmpada')) guessedIcon = lampIcon;
        else if (name.includes('airfry') || name.includes('fritadeira')) guessedIcon = airfry;
        else if (name.includes('carregador') || name.includes('charger')) guessedIcon = carregador;

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

  // Save edited device
  const saveEditedConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) { setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊'); return; }
    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) { setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`); return; }

    setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate } : c));
    closeAllModals();
  };

  // Save new device manually
  const saveManualConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) { setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊'); return; }
    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase())) { setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`); return; }

    onConnectDevice(newConexion.text, newConexion.text, newConexion.icon, newConexion.backgroundColor);
    closeAllModals();
  };

  // Request device removal (opens confirmation dialog)
  const removeConexion = (id) => { setConexionToDelete(id); setShowConfirmDialog(true); };

  // Confirm device removal
  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete);
      setTimeout(() => { onRemoveDevice(conexionToDelete); setRemovingId(null); closeAllModals(); }, 300);
    }
  };

  // Cancel removal
  const handleCancelRemove = () => closeAllModals();

  // Open device edit form
  const handleEditClick = (c) => {
    if (c.connected) {
      setNewConexion({ text: c.text, icon: c.icon, backgroundColor: c.backgroundColor || availableColors[0], connected: c.connected, connectedDate: c.connectedDate });
      setActiveIcon(c.icon); setActiveColor(c.backgroundColor || availableColors[0]); setEditingId(c.id); setErrorMessage('');
      setSelectedConexion(null); setShowAddForm(true); setIsSearchingBluetooth(false); setModoManual(true);
    }
  };

  // Toggle connection status (on/off)
  const toggleConnection = (id, newDesiredState) => {
    onToggleConnection(id, newDesiredState);
    if (selectedConexion && selectedConexion.id === id && !newDesiredState) setSelectedConexion(null);
  };

  // Open device details modal
  const handleConexionClick = (c, e) => {
    // Prevent click if a drag was initiated or if a touch long-press is pending
    if (isDragging || touchStartTimer.current) {
        return;
    }
    // Apenas abre os detalhes se não estiver arrastando e o clique for no elemento principal ou em seus filhos diretos de overlay
    if (c.connected && (e.target === e.currentTarget || (e.target.tagName === 'SPAN' && e.target.classList.contains('conexion-text-overlay')) || (e.target.tagName === 'IMG' && e.target.classList.contains('conexion-icon-overlay')))) {
      setSelectedConexion(c);
    }
  };

  // Date formatting
  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // Calculate connection duration
  const getConnectionDuration = (connectedDateString) => {
    if (!connectedDateString) return 'N/A';
    const diff = new Date() - new Date(connectedDateString);
    const [seconds, minutes, hours, days] = [Math.floor(diff / 1000), Math.floor(diff / (1000 * 60)), Math.floor(diff / (1000 * 60 * 60)), Math.floor(diff / (1000 * 60 * 60 * 24))];

    let duration = [];
    if (days > 0) duration.push(`${days} dia(s)`);
    if (hours % 24 > 0) duration.push(`${hours % 24} hora(s)`);
    if (minutes % 60 > 0 && days === 0) duration.push(`${minutes % 60} minuto(s)`);
    if (seconds % 60 > 0 && hours === 0 && days === 0) duration.push(`${seconds % 60} segundo(s)`);
    return duration.length === 0 ? 'Menos de um segundo' : duration.join(' e ');
  };

  // --- Drag and Drop Handlers (Desktop) ---
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    currentDragElement.current = e.currentTarget;
    if (currentDragElement.current) {
      setTimeout(() => {
          currentDragElement.current.classList.add('dragging');
      }, 0);
    }
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    if (dragItem.current === null || dragItem.current === index) return;
    dragOverItem.current = index;
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDragEnd = (e) => {
    if (currentDragElement.current) {
        currentDragElement.current.classList.remove('dragging');
        currentDragElement.current = null;
    }
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.remove('drag-over');
    }

    const draggedIndex = dragItem.current;
    const droppedIndex = dragOverItem.current;

    if (draggedIndex === null || droppedIndex === null || draggedIndex === droppedIndex) {
      return;
    }

    const newConexions = [...conexions];
    const [draggedItemData] = newConexions.splice(draggedIndex, 1);
    newConexions.splice(droppedIndex, 0, draggedItemData);

    setConexions(newConexions);
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // --- Touch Handlers (Mobile) ---
  const handleTouchStart = (e, index) => {
    e.preventDefault(); // Prevent default browser actions like scrolling or text selection
    touchStartTimer.current = setTimeout(() => {
        setIsDragging(true);
        dragItem.current = index;
        currentDragElement.current = e.currentTarget;
        if (currentDragElement.current) {
            currentDragElement.current.classList.add('dragging');
        }
    }, 700); // Duration for long press to initiate drag
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Crucial to prevent scrolling while dragging

    if (!isDragging) {
      // If not actively dragging, clear the timer (if any) and return
      if (touchStartTimer.current) {
        clearTimeout(touchStartTimer.current);
        touchStartTimer.current = null;
      }
      return;
    }

    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    const hoveredConexionElement = targetElement ? targetElement.closest('.retanguloAdicionado') : null;

    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));

    if (hoveredConexionElement) {
        const parentChildren = Array.from(hoveredConexionElement.parentNode?.children || []);
        const hoveredIndex = parentChildren.indexOf(hoveredConexionElement);
        if (hoveredIndex !== -1 && hoveredIndex !== dragItem.current) {
            dragOverItem.current = hoveredIndex;
            hoveredConexionElement.classList.add('drag-over');
        } else {
            dragOverItem.current = null;
        }
    } else {
        dragOverItem.current = null;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartTimer.current) {
        clearTimeout(touchStartTimer.current);
        touchStartTimer.current = null;
    }

    if (isDragging) {
      if (currentDragElement.current) {
        currentDragElement.current.classList.remove('dragging');
        currentDragElement.current = null;
      }
      document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));

      const draggedIndex = dragItem.current;
      const droppedIndex = dragOverItem.current;

      if (draggedIndex !== null && droppedIndex !== null && draggedIndex !== droppedIndex) {
        const newConexions = [...conexions];
        const [draggedItemData] = newConexions.splice(draggedIndex, 1);
        newConexions.splice(droppedIndex, 0, draggedItemData);
        setConexions(newConexions);
      }
      dragItem.current = null;
      dragOverItem.current = null;
      setIsDragging(false);
    }
  };

  // Filtered lists based on activeList state
  const connectedDevices = conexions.filter(c => c.connected);
  const disconnectedDevices = conexions.filter(c => !c.connected);

  const devicesToDisplay = activeList === 'connected' ? connectedDevices : disconnectedDevices;

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>{tituloPrincipal}</h1>

      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> {adicionarAparelho}
      </button>

      {/* Aparelhoconecado e nao ocentados*/}



<div className="list-toggle-buttons">
  <span className={`slider-bar ${activeList}`} />

  <button
    className={`toggle-button connected-btn ${activeList === 'connected' ? 'active' : ''}`}
    onClick={() => setActiveList('connected')}
  >
    Conectados ({connectedDevices.length})
  </button>

  <button
    className={`toggle-button disconnected-btn ${activeList === 'disconnected' ? 'active' : ''}`}
    onClick={() => setActiveList('disconnected')}
  >
    Desconectados ({disconnectedDevices.length})
  </button>
</div>





      {/* Fim Aparelhoconecado e nao ocentados*/}




      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : modoManual ? 'Adicionar Novo Aparelho Manualmente' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {(editingId || modoManual) ? (
              <>
                <input title="Nome do aparelho" type="text" placeholder="Nome do Aparelho" value={newConexion.text} onChange={(e) => setNewConexion({ ...newConexion, text: e.target.value })} />
                <div className="icon-picker-styled">
                  <label>{escolherIcone}</label>
                  <div className="icons">
                    {availableIcons.map(icon => (
                      <button key={icon.name} className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`} onClick={() => { setNewConexion({ ...newConexion, icon: icon.src }); setActiveIcon(icon.src); }} type="button">
                        <img src={icon.src} alt={icon.name} style={{ width: 30, height: 30 }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className="tipoDoFundoConexao">{escolherCorDefundo}</label>
                  <div className="colors">
                    {availableColors.map(color => (
                      <button key={color} className={`color-option ${activeColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }} type="button" />
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={editingId ? saveEditedConexion : saveManualConexion} className="save-button-styled" type="button">
                    {editingId ? 'Salvar Edição' : 'Adicionar Aparelho'}
                  </button>
                  <button onClick={closeAllModals} className="cancel-button-styled" type="button">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <p className='paragrafoAdiconarAparelhos'>{btnBluetooth}</p>
                <button onClick={handleSearchAndConnectBluetooth} className="add-button-styled" disabled={isSearchingBluetooth} type="button">
                  {isSearchingBluetooth ? 'Procurando Aparelhos Bluetooth' : (
                    <>
                      <img src={bluetoothIcon} title="Procurar" alt="Bluetooth" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />
                      {procurarAparelhosBluetooth}
                    </>
                  )}
                </button>
                <button onClick={abrirModoManual} className="add-button-styled" style={{ marginTop: '10px' }} disabled={isSearchingBluetooth} type="button">
                  <img src={manual} alt="Bluetooth" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />
                 {adicicionarAparelhoManualmente}
                </button>
                {isSearchingBluetooth && (<p className="connecting-message">{esperaMenuBluetoothAbrir}</p>)}
                <div className="form-actions">
                  <button onClick={closeAllModals} className="cancel-button-styled" disabled={isSearchingBluetooth} type="button" title='Ativar | Desativar aparelho'>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Render the list based on devicesToDisplay */}
      <div className="conexions-list">
        {devicesToDisplay.length === 0 && (
          <div className="placeholder-image-container">
            <br /><br /><br />
            <img src={placeholderImage} alt="Nenhum aparelho aqui" className="placeholder-image" />
            <p className="placeholder-text">
              {activeList === 'connected' ? 'Nenhum aparelho conectado no momento.' : 'Nenhum aparelho desconectado no momento.'}
            </p>
          </div>
        )}

        {devicesToDisplay.map((c, index) => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''} ${isDragging && dragItem.current === index ? 'dragging' : ''}`}
            style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            onClick={(e) => handleConexionClick(c, e)}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {c.connected && (
              <div className="qrcode-top-left">
                <button className="qrcode-button" onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }} type="button">
                  <img src={imgQrcode} alt="QR Code" className="qrCodeAparelhoConectado" />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">{mensagemAparelhoDesativado}</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
            </div>
            <div className="actions-overlay">
              <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }} type="button">×</button>
              <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }} type="button" disabled={!c.connected}>
                <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
              </button>
              <label className="switch">
                <input type="checkbox" checked={c.connected} onChange={(e) => { e.stopPropagation(); toggleConnection(c.id, e.target.checked); }} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {selectedConexion && (
        <div className="modal-overlay" onClick={() => setSelectedConexion(null)}>
          <div className="detalhes-aparelho-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedConexion(null)}>X</button>
            <h2 title="Detalhes do Aparelho">{detalhesaparelhoAmpliados}</h2>
            <div className="detalhes-content">
              <img src={selectedConexion.icon} alt={selectedConexion.text} className="detalhes-icon" />
              <h3>{selectedConexion.text}</h3>
              <p title="Status">Status: {selectedConexion.connected ? 'Conectado' : 'Desconectado'}</p>
              {selectedConexion.connected && (
                <>
                  <p>{tempoAparelhoConectado}: {formatDate(selectedConexion.connectedDate)}</p>
                  <p>{duracaoConecxao}{getConnectionDuration(selectedConexion.connectedDate)}</p>
                </>
              )}
              <div className="detalhes-actions">
                <button onClick={() => toggleConnection(selectedConexion.id, !selectedConexion.connected)} className={`toggle-connection-button ${selectedConexion.connected ? 'disconnect' : 'connect'}`}>
                  {selectedConexion.connected ? 'Desconectar' : 'Conectar'}
                </button>
                <button onClick={() => { handleEditClick(selectedConexion); setSelectedConexion(null); }} className="edit-button-details" disabled={!selectedConexion.connected}>
                  {btnEditar}
                </button>
                <button onClick={() => { removeConexion(selectedConexion.id); setSelectedConexion(null); }} className="remove-button-details">
                  {btnRemover}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="modal-overlay" onClick={handleCancelRemove}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <p>{mensagemExcluirAparelho}</p>
            <div className="confirmation-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
              <button onClick={handleCancelRemove} className="cancel-button">Não</button>
            </div>
          </div>
        </div>
      )}

      {visibleQRCode && (
        <div className="modal-overlay" onClick={() => setVisibleQRCode(null)} title="Qrcode">
          <div className="qr-code-modal" onClick={e => e.stopPropagation()}>
            <h3 title="">QR Code do aparelho: {visibleQRCode.text}</h3>
            <br />
            <QRCodeCanvas
              value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(visibleQRCode.text)}&icon=${getIconKeyBySrc(visibleQRCode.icon)}&bgColor=${encodeURIComponent(visibleQRCode.backgroundColor)}`}
              size={256} level="H" includeMargin={true}
            />
            <button className="close-button" onClick={() => setVisibleQRCode(null)} title="Fechar QrCde">X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;