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
import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import airfry from '../../imgs/imgConexao/airfry.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';
import editIcon from '../../imgs/imgConexao/pencil.png'
import imgQrcode from '../../imgs/imgConexao/qrCode.png';
import semConexao from '../../imgs/imgConexao/semConexao.png';
import bluetoothIcon from '../../imgs/imgConexao/bluetooth.png';
import manual from '../../imgs/imgConexao/manual.png';

import {
  tituloPrincipal, adicionarAparelho, escolherIcone, escolherCorDefundo, btnBluetooth,
  procurarAparelhosBluetooth, adicicionarAparelhoManualmente, esperaMenuBluetoothAbrir, mensagemAparelhoDesativado,
  detalhesaparelhoAmpliados, mensagemExcluirAparelho, btnEditar, btnRemover, tempoAparelhoConectado, duracaoConecxao
} from '../../constants/Conexao/index.js';

// Constantes
const availableColors = [
  '#FFFFF0', '#FFFFE0', '#E0FFFF', '#F0FFF0', '#F5FFFA',
  '#FFFACD', '#F0FFFF', '#FFFAF0', '#F8F8FF'
];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";
const availableIcons = [
  { name: 'tv', src: tvIcon }, { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon }, { name: 'airfry', src: airfry },
  { name: 'carregador', src: carregador }
];
const iconMap = availableIcons.reduce((acc, icon) => ({ ...acc, [icon.name]: icon.src }), {});

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  const [uiState, setUiState] = useState({
    showAddForm: false, modoManual: false, isSearchingBluetooth: false, errorMessage: '',
    showConfirmDialog: false, visibleQRCode: null, selectedConexion: null, activeList: 'connected',
    newConexion: { text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: '' },
    activeIcon: null, activeColor: availableColors[0], editingId: null, removingId: null, conexionToDelete: null
  });

  const {
    showAddForm, modoManual, isSearchingBluetooth, errorMessage, showConfirmDialog,
    visibleQRCode, selectedConexion, activeList, newConexion, activeIcon,
    activeColor, editingId, removingId, conexionToDelete
  } = uiState;

  // Drag and Drop States
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const touchStartTimer = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentDragElement = useRef(null);

  const updateUiState = (newState) => setUiState(prev => ({ ...prev, ...newState }));
  const resetFormState = () => updateUiState({
    newConexion: { text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() },
    activeIcon: null, activeColor: availableColors[0], editingId: null, errorMessage: ''
  });

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
          updateUiState({ errorMessage: `Já existe um aparelho chamado "${nome}".` });
        } else {
          onConnectDevice(nome, nome, iconSrc, actualBgColor);
        }
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions]);

  // Centralized close function for all modals/forms
  const closeAllModals = () => {
    updateUiState({
      showAddForm: false, modoManual: false, errorMessage: '', isSearchingBluetooth: false,
      showConfirmDialog: false, visibleQRCode: null, selectedConexion: null,
    });
    resetFormState();
    if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
    setIsDragging(false);
    if (currentDragElement.current) { currentDragElement.current.classList.remove('dragging'); currentDragElement.current = null; }
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const handleAddClick = () => { resetFormState(); updateUiState({ showAddForm: true, isSearchingBluetooth: false, modoManual: false, selectedConexion: null }); };
  const abrirModoManual = () => { resetFormState(); updateUiState({ modoManual: true, showAddForm: true, isSearchingBluetooth: false, selectedConexion: null }); };

  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) {
      updateUiState({ errorMessage: 'Seu navegador não suporta Web Bluetooth. Use Chrome, Edge ou Opera.' });
      return;
    }
    updateUiState({ isSearchingBluetooth: true, errorMessage: '' });
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      if (device) {
        const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';
        const name = (deviceName || '').toLowerCase();

        let guessedIcon = lampIcon; // padrão

        if (name.includes('tv') || name.includes('television') || name.includes('monitor')) {
          guessedIcon = tvIcon;
        } else if (name.includes('ar') || name.includes('condicionado')) {
          guessedIcon = airConditionerIcon;
        } else if (name.includes('lamp') || name.includes('lâmpada')) {
          guessedIcon = lampIcon;
        } else if (name.includes('airfry') || name.includes('fritadeira')) {
          guessedIcon = airfry;
        } else if (name.includes('carregador') || name.includes('charger')) {
          guessedIcon = carregador;
        }

        console.log('Dispositivo Bluetooth:', deviceName, '| Ícone escolhido:', guessedIcon);

        if (conexions.some(c => c.text.toLowerCase() === deviceName.toLowerCase())) {
          updateUiState({ errorMessage: `Já existe um aparelho chamado "${deviceName}".`, isSearchingBluetooth: false });
          return;
        }
        onConnectDevice(deviceName, deviceName, guessedIcon, availableColors[0]);
        closeAllModals();
      } else {
        updateUiState({ errorMessage: 'Nenhum aparelho Bluetooth selecionado.' });
      }
    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      updateUiState({
        errorMessage: error.name === 'NotFoundError' ? 'Nenhum aparelho Bluetooth encontrado ou selecionado.' :
          error.name === 'NotAllowedError' ? 'Permissão de Bluetooth negada.' :
            error.message.includes('User cancelled') ? 'Seleção de aparelho Bluetooth cancelada.' :
              'Falha na conexão Bluetooth. Tente novamente.'
      });
    } finally {
      updateUiState({ isSearchingBluetooth: false });
    }
  };

  const saveConexion = (isEditing) => {
    if (!newConexion.text.trim() || !newConexion.icon) { updateUiState({ errorMessage: 'Dê um nome e selecione um ícone para o aparelho 😊' }); return; }
    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      updateUiState({ errorMessage: `Já existe um aparelho com o nome "${newConexion.text}".` }); return;
    }
    isEditing
      ? setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate } : c))
      : onConnectDevice(newConexion.text, newConexion.text, newConexion.icon, newConexion.backgroundColor);
    closeAllModals();
  };

  const removeConexion = (id) => updateUiState({ conexionToDelete: id, showConfirmDialog: true });
  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      updateUiState({ removingId: conexionToDelete });
      setTimeout(() => { onRemoveDevice(conexionToDelete); updateUiState({ removingId: null }); closeAllModals(); }, 300);
    }
  };
  const handleCancelRemove = () => closeAllModals();

  const handleEditClick = (c) => {
    if (c.connected) {
      updateUiState({
        newConexion: { text: c.text, icon: c.icon, backgroundColor: c.backgroundColor || availableColors[0], connected: c.connected, connectedDate: c.connectedDate },
        activeIcon: c.icon, activeColor: c.backgroundColor || availableColors[0], editingId: c.id, errorMessage: '',
        selectedConexion: null, showAddForm: true, isSearchingBluetooth: false, modoManual: true,
      });
    }
  };

  const toggleConnection = (id, newDesiredState) => {
    onToggleConnection(id, newDesiredState);
    if (selectedConexion?.id === id && !newDesiredState) updateUiState({ selectedConexion: null });
  };

  const handleConexionClick = (c, e) => {
    if (isDragging || touchStartTimer.current) return;
    if (c.connected && (e.target === e.currentTarget || e.target.classList.contains('conexion-text-overlay') || e.target.classList.contains('conexion-icon-overlay'))) {
      updateUiState({ selectedConexion: c });
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const getConnectionDuration = (connectedDateString) => {
    if (!connectedDateString) return 'N/A';
    const diff = new Date() - new Date(connectedDateString);
    const [s, m, h, d] = [Math.floor(diff / 1000), Math.floor(diff / (1000 * 60)), Math.floor(diff / (1000 * 60 * 60)), Math.floor(diff / (1000 * 60 * 60 * 24))];
    const duration = [];
    if (d > 0) duration.push(`${d} dia(s)`);
    if (h % 24 > 0) duration.push(`${h % 24} hora(s)`);
    if (m % 60 > 0 && d === 0) duration.push(`${m % 60} minuto(s)`);
    if (s % 60 > 0 && h === 0 && d === 0) duration.push(`${s % 60} segundo(s)`);
    return duration.length === 0 ? 'Menos de um segundo' : duration.join(' e ');
  };

  // Drag and Drop Handlers (Desktop)
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    currentDragElement.current = e.currentTarget;
    setTimeout(() => currentDragElement.current?.classList.add('dragging'), 0);
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (e, index) => {
    if (dragItem.current === null || dragItem.current === index) return;
    dragOverItem.current = index;
    e.currentTarget.classList.add('drag-over');
  };
  const handleDragLeave = (e) => e.currentTarget.classList.remove('drag-over');
  const handleDragEnd = () => {
    currentDragElement.current?.classList.remove('dragging');
    currentDragElement.current = null;
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.currentTarget?.classList.remove('drag-over');
    const [draggedIndex, droppedIndex] = [dragItem.current, dragOverItem.current];
    if (draggedIndex === null || droppedIndex === null || draggedIndex === droppedIndex) return;
    const newConexions = [...conexions];
    const [draggedItemData] = newConexions.splice(draggedIndex, 1);
    newConexions.splice(droppedIndex, 0, draggedItemData);
    setConexions(newConexions);
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  // Touch Handlers (Mobile)
  const handleTouchStart = (e, index) => {
    touchStartTimer.current = setTimeout(() => {
      setIsDragging(true); dragItem.current = index;
      currentDragElement.current = e.currentTarget;
      currentDragElement.current?.classList.add('dragging');
    }, 700);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) { if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; } return; }
    e.preventDefault();
    const touch = e.touches[0];
    const hoveredConexionElement = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.retanguloAdicionado');
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (hoveredConexionElement) {
      const parentChildren = Array.from(hoveredConexionElement.parentNode?.children || []);
      const hoveredIndex = parentChildren.indexOf(hoveredConexionElement);
      if (hoveredIndex !== -1 && hoveredIndex !== dragItem.current) {
        dragOverItem.current = hoveredIndex;
        hoveredConexionElement.classList.add('drag-over');
      } else dragOverItem.current = null;
    } else dragOverItem.current = null;
  };
  const handleTouchEnd = () => {
    if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
    if (!isDragging) return;

    currentDragElement.current?.classList.remove('dragging');
    currentDragElement.current = null;
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));

    const [draggedIndex, droppedIndex] = [dragItem.current, dragOverItem.current];
    if (draggedIndex !== null && droppedIndex !== null && draggedIndex !== droppedIndex) {
      const newConexions = [...conexions];
      const [draggedItemData] = newConexions.splice(draggedIndex, 1);
      newConexions.splice(droppedIndex, 0, draggedItemData);
      setConexions(newConexions);
    }
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };

  const devicesToDisplay = activeList === 'connected' ? conexions.filter(c => c.connected) : conexions.filter(c => !c.connected);

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>{tituloPrincipal}</h1>
      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> {adicionarAparelho}
      </button>

      <div className="list-toggle-buttons">
        <span className={`slider-bar ${activeList}`} />
        <button className={`toggle-button connected-btn ${activeList === 'connected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'connected' })}>
          Conectados ({conexions.filter(c => c.connected).length})
        </button>
        <button className={`toggle-button disconnected-btn ${activeList === 'disconnected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'disconnected' })}>
          Desconectados ({conexions.filter(c => !c.connected).length})
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content conexao-modal">
            <h2>{modoManual ? adicicionarAparelhoManualmente : procurarAparelhosBluetooth}</h2>
            {modoManual ? (
              <>
                <input
                  type="text"
                  value={newConexion.text}
                  onChange={e => updateUiState({ newConexion: { ...newConexion, text: e.target.value }, errorMessage: '' })}
                  placeholder="Nome do aparelho"
                  maxLength={30}
                  className="input-text"
                />

                <div className="icon-picker">
                  {availableIcons.map((icon) => (
                    <img
                      key={icon.name}
                      src={icon.src}
                      alt={icon.name}
                      className={`icon-select ${activeIcon === icon.src ? 'selected' : ''}`}
                      onClick={() => updateUiState({ activeIcon: icon.src, newConexion: { ...newConexion, icon: icon.src }, errorMessage: '' })}
                    />
                  ))}
                </div>

                <div className="color-picker">
                  {availableColors.map(color => (
                    <div
                      key={color}
                      className={`color-swatch ${activeColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateUiState({ activeColor: color, newConexion: { ...newConexion, backgroundColor: color }, errorMessage: '' })}
                    />
                  ))}
                </div>

                <div className="button-row">
                  <button onClick={() => saveConexion(editingId !== null)}>{editingId !== null ? 'Salvar' : 'Adicionar'}</button>
                  <button onClick={closeAllModals}>Cancelar</button>
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
              </>
            ) : (
              <>
                <button onClick={handleSearchAndConnectBluetooth} disabled={isSearchingBluetooth}>
                  {isSearchingBluetooth ? 'Procurando...' : btnBluetooth}
                </button>

                <button onClick={abrirModoManual}>{adicicionarAparelhoManualmente}</button>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <button className="close-btn" onClick={closeAllModals}>Fechar</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="conexions-list">
        {devicesToDisplay.length === 0 && (
          <div className="no-devices-message">
            {activeList === 'connected' ? 'Nenhum aparelho conectado.' : 'Nenhum aparelho desconectado.'}
          </div>
        )}
        {devicesToDisplay.map((c, index) => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${editingId === c.id ? 'editing' : ''} ${removingId === c.id ? 'removing' : ''}`}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragEnter={e => handleDragEnter(e, index)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onTouchStart={e => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={e => handleConexionClick(c, e)}
            style={{ backgroundColor: c.backgroundColor }}
            title={`Clique para ver detalhes`}
          >
            <img src={c.icon || lampIcon} alt="Ícone aparelho" className="icon-conexao" />
            <span className="conexion-text-overlay">{c.text}</span>

            <button className="btn-editar" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}>
              <img src={editIcon} alt="Editar" />
            </button>

            <button className="btn-remover" onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }}>
              X
            </button>

            <button className="btn-toggle-connection" onClick={(e) => { e.stopPropagation(); toggleConnection(c.id, !c.connected); }}>
              {c.connected ? 'Desconectar' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>

      {showConfirmDialog && (
        <div className="confirm-dialog">
          <p>{mensagemExcluirAparelho}</p>
          <button onClick={handleConfirmRemove}>Sim</button>
          <button onClick={handleCancelRemove}>Não</button>
        </div>
      )}

      {selectedConexion && (
        <div className="detalhes-aparelho">
          <h3>{detalhesaparelhoAmpliados}</h3>
          <p><b>Nome:</b> {selectedConexion.text}</p>
          <p><b>Status:</b> {selectedConexion.connected ? 'Conectado' : 'Desconectado'}</p>
          <p><b>Conectado desde:</b> {formatDate(selectedConexion.connectedDate)}</p>
          <p><b>Duração da conexão:</b> {getConnectionDuration(selectedConexion.connectedDate)}</p>
          <button onClick={() => updateUiState({ selectedConexion: null })}>Fechar</button>
        </div>
      )}

      {visibleQRCode && (
        <div className="qr-code-modal">
          <QRCodeCanvas
            value={`${siteBaseURL}?add=${encodeURIComponent(visibleQRCode.text)}&icon=${getIconKeyBySrc(visibleQRCode.icon)}&bgColor=${visibleQRCode.backgroundColor}`}
            size={220}
            level="H"
            includeMargin={true}
          />
          <button onClick={() => updateUiState({ visibleQRCode: null })}>Fechar</button>
        </div>
      )}
    </div>
  );
};

export default Conexoes;
