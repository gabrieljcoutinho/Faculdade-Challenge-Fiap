import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import '../../CSS/Conexao/detalhesAparelhos.css'
import '../../CSS/Conexao/imgNaoConectado.css';
import '../../CSS/Conexao/mensagemRemoverAparelho.css';
import '../../CSS/Conexao/mensagemMuitosAprelhosConectadosAoMesmoTempo.css';
import '../../CSS/Conexao/btnConectadoEnaoConectado.css'
import '../../CSS/Conexao/marcadorDeConsumo.css'
import '../../CSS/Conexao/luzPelaImgNaoConectado.css'
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
import { tituloPrincipal, adicionarAparelho, escolherIcone, escolherCorDefundo, btnBluetooth, procurarAparelhosBluetooth, adicicionarAparelhoManualmente, esperaMenuBluetoothAbrir, mensagemAparelhoDesativado, detalhesaparelhoAmpliados, mensagemExcluirAparelho, btnEditar, btnRemover, tempoAparelhoConectado, duracaoConecxao } from '../../constants/Conexao/index.js';

const availableColors = ['#FFFFF0', '#FFFFE0', '#E0FFFF', '#F0FFF0', '#F5FFFA', '#FFFACD', '#F0FFFF', '#FFFAF0', '#F8F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";
const availableIcons = [
  { name: 'tv', src: tvIcon }, { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon }, { name: 'airfry', src: airfry }, { name: 'carregador', src: carregador }
];
const iconMap = availableIcons.reduce((acc, icon) => ({ ...acc, [icon.name]: icon.src }), {});

const Conexoes = ({ aparelhos, setAparelhos, onConnectDevice, onRemoveDevice }) => {
  const { search, pathname } = useLocation();

  const [uiState, setUiState] = useState({
    showAddForm: false, modoManual: false, isSearchingBluetooth: false, errorMessage: '',
    showConfirmDialog: false, visibleQRCode: null, selectedConexion: null, activeList: 'connected',
    newConexion: { nome: '', imagem: '', corFundo: availableColors[0] },
    activeIcon: null, activeColor: availableColors[0], editingId: null, conexionToDelete: null,
  });

  const {
    showAddForm, modoManual, isSearchingBluetooth, errorMessage, showConfirmDialog,
    visibleQRCode, selectedConexion, activeList, newConexion, activeIcon, activeColor,
    editingId, conexionToDelete
  } = uiState;

  const dragItem = useRef(null), dragOverItem = useRef(null), touchStartTimer = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentDragElement = useRef(null);
  const [connectionTimers, setConnectionTimers] = useState({});

  const updateUiState = (newState) => setUiState(prev => ({ ...prev, ...newState }));
  const getIconKeyBySrc = (src) => availableIcons.find(icon => icon.src === src)?.name || '';

  const handleDisconnectAll = useCallback(() => {
    setAparelhos(prevAparelhos =>
      prevAparelhos.map(c => {
        if (c.conectado) {
          let updatedConexion = { ...c, conectado: false };
          if (c.connectedDate) {
            const [now, connectedStartTime] = [new Date().getTime(), new Date(c.connectedDate).getTime()];
            updatedConexion.accumulatedSeconds = (c.accumulatedSeconds || 0) + (now - connectedStartTime) / 1000;
            updatedConexion.connectedDate = null;
          }
          return updatedConexion;
        }
        return c;
      })
    );
  }, [setAparelhos]);

  const handleRemoveAll = useCallback(() => {
    setAparelhos([]);
  }, [setAparelhos]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const [nome, iconKey, bgColor] = [params.get('add'), params.get('icon'), params.get('bgColor')];
    if (!nome || !iconKey) return;
    const iconSrc = iconMap[iconKey];
    if (!iconSrc) return;
    const actualBgColor = availableColors.includes(bgColor) ? bgColor : availableColors[0];
    if (aparelhos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
      updateUiState({ errorMessage: `Já existe um aparelho chamado "${nome}".` });
    } else {
      onConnectDevice(nome, iconSrc, actualBgColor);
    }
    window.history.replaceState({}, document.title, pathname);
  }, [search, onConnectDevice, aparelhos, pathname]);

  useEffect(() => {
    const timers = aparelhos.reduce((acc, c) => {
      if (c.conectado && c.connectedDate) {
        acc[c.id] = setInterval(() => {
          setConnectionTimers(prev => ({ ...prev, [c.id]: (new Date().getTime() - new Date(c.connectedDate).getTime()) / 1000 }));
        }, 1000);
      }
      return acc;
    }, {});
    return () => Object.values(timers).forEach(clearInterval);
  }, [aparelhos]);

  const closeAllModals = () => {
    updateUiState({
      showAddForm: false, modoManual: false, errorMessage: '', isSearchingBluetooth: false,
      showConfirmDialog: false, visibleQRCode: null, selectedConexion: null,
      newConexion: { nome: '', imagem: '', corFundo: availableColors[0] },
      activeIcon: null, activeColor: availableColors[0], editingId: null, conexionToDelete: null,
    });
    if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
    setIsDragging(false);
    if (currentDragElement.current) { currentDragElement.current.classList.remove('dragging'); currentDragElement.current = null; }
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const resetFormState = () => updateUiState({
    newConexion: { nome: '', imagem: '', corFundo: availableColors[0] },
    activeIcon: null, activeColor: availableColors[0], editingId: null, errorMessage: '', selectedConexion: null,
  });

  const handleAddClick = () => { resetFormState(); updateUiState({ showAddForm: true, isSearchingBluetooth: false, modoManual: false }); };
  const abrirModoManual = () => { resetFormState(); updateUiState({ modoManual: true, isSearchingBluetooth: false }); };

  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) { updateUiState({ errorMessage: 'Seu navegador não suporta Web Bluetooth. Use Chrome, Edge ou Opera.' }); return; }
    updateUiState({ isSearchingBluetooth: true, errorMessage: '' });
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      if (!device) { updateUiState({ errorMessage: 'Nenhum aparelho Bluetooth selecionado.', isSearchingBluetooth: false }); return; }
      const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';
      const name = deviceName.toLowerCase();
      const guessedIcon = name.includes('tv') || name.includes('monitor') ? tvIcon :
        name.includes('ar') || name.includes('condicionado') ? airConditionerIcon :
          name.includes('lamp') || name.includes('lâmpada') ? lampIcon :
            name.includes('airfry') || name.includes('fritadeira') ? airfry :
              name.includes('carregador') || name.includes('charger') ? carregador : lampIcon;
      if (aparelhos.some(c => c.nome.toLowerCase() === deviceName.toLowerCase())) {
        updateUiState({ errorMessage: `Já existe um aparelho chamado "${deviceName}".`, isSearchingBluetooth: false });
        return;
      }
      onConnectDevice(deviceName, guessedIcon, availableColors[0]);
      closeAllModals();
    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      const errorMessage = error.name === 'NotFoundError' ? 'Nenhum aparelho Bluetooth encontrado ou selecionado.' :
        error.name === 'NotAllowedError' ? 'Permissão de Bluetooth negada.' :
          error.message.includes('User cancelled') ? 'Seleção de aparelho Bluetooth cancelada.' :
            'Falha na conexão Bluetooth. Tente novamente.';
      updateUiState({ errorMessage, isSearchingBluetooth: false });
    }
  };

  const saveConexion = useCallback((isEdit) => {
    if (!newConexion.nome.trim() || !newConexion.imagem) {
      updateUiState({ errorMessage: 'Dê um nome e selecione um ícone para o aparelho 😊' });
      return;
    }
    if (aparelhos.some(c => c.nome.toLowerCase() === newConexion.nome.toLowerCase() && (!isEdit || c.id !== editingId))) {
      updateUiState({ errorMessage: `Já existe um aparelho com o nome "${newConexion.nome}".` });
      return;
    }
    if (isEdit) {
      setAparelhos(prev => prev.map(c => c.id === editingId ? {
        ...c,
        nome: newConexion.nome,
        imagem: newConexion.imagem,
        corFundo: newConexion.corFundo
      } : c));
    } else {
      onConnectDevice(newConexion.nome, newConexion.imagem, newConexion.corFundo);
    }
    closeAllModals();
  }, [aparelhos, newConexion, editingId, onConnectDevice, setAparelhos]);

  const removeConexion = (id) => updateUiState({ conexionToDelete: id, showConfirmDialog: true });
  const handleConfirmRemove = () => { onRemoveDevice(conexionToDelete); closeAllModals(); };
  const handleCancelRemove = () => closeAllModals();

  const handleEditClick = (c) => c.conectado && updateUiState({
    newConexion: { nome: c.nome, imagem: c.imagem, corFundo: c.corFundo || availableColors[0] },
    activeIcon: c.imagem, activeColor: c.corFundo || availableColors[0], editingId: c.id,
    errorMessage: '', selectedConexion: null, showAddForm: true, isSearchingBluetooth: false, modoManual: true,
  });

  const toggleConnection = useCallback((id, newDesiredState) => {
    setAparelhos(prevAparelhos => prevAparelhos.map(c => {
      if (c.id === id) {
        let updatedConexion = { ...c };
        if (c.conectado && !newDesiredState) {
          if (c.connectedDate) {
            const [now, connectedStartTime] = [new Date().getTime(), new Date(c.connectedDate).getTime()];
            updatedConexion.accumulatedSeconds = (c.accumulatedSeconds || 0) + (now - connectedStartTime) / 1000;
            updatedConexion.connectedDate = null;
          }
          updatedConexion.conectado = false;
        } else if (!c.conectado && newDesiredState) {
          updatedConexion.connectedDate = new Date().toISOString();
          updatedConexion.conectado = true;
        }
        return updatedConexion;
      }
      return c;
    }));
    if (selectedConexion && selectedConexion.id === id && !newDesiredState) updateUiState({ selectedConexion: null });
  }, [setAparelhos, selectedConexion]);

  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const getConnectionDuration = (connectedDateString, accumulatedSeconds = 0) => {
    let totalSeconds = accumulatedSeconds || 0;
    if (connectedDateString) totalSeconds += (new Date().getTime() - new Date(connectedDateString).getTime()) / 1000;
    if (totalSeconds <= 0) return 'Menos de um segundo';
    const [s, m, h, d] = [Math.floor(totalSeconds), Math.floor(totalSeconds / 60), Math.floor(totalSeconds / 3600), Math.floor(totalSeconds / 86400)];
    let duration = [];
    if (d > 0) duration.push(`${d} dia(s)`);
    if (h % 24 > 0) duration.push(`${h % 24} hora(s)`);
    if (m % 60 > 0 && d === 0) duration.push(`${m % 60} minuto(s)`);
    if (s % 60 > 0 && h === 0 && d === 0) duration.push(`${s % 60} segundo(s)`);
    return duration.length === 0 ? 'Menos de um segundo' : duration.join(' e ');
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index; currentDragElement.current = e.currentTarget;
    setTimeout(() => currentDragElement.current?.classList.add('dragging'), 0);
    setIsDragging(true); e.dataTransfer.setData('text/plain', index); e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (e, index) => {
    if (dragItem.current === null || dragItem.current === index) return;
    dragOverItem.current = index; e.currentTarget.classList.add('drag-over');
  };
  const handleDragLeave = (e) => e.currentTarget.classList.remove('drag-over');
  const handleDragEnd = () => {
    currentDragElement.current?.classList.remove('dragging'); currentDragElement.current = null;
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.currentTarget?.classList.remove('drag-over');
    const [draggedIdx, droppedIdx] = [dragItem.current, dragOverItem.current];
    if (draggedIdx === null || droppedIdx === null || draggedIdx === droppedIdx) return;
    const newAparelhos = [...aparelhos];
    const [draggedItemData] = newAparelhos.splice(draggedIdx, 1);
    newAparelhos.splice(droppedIdx, 0, draggedItemData);
    setAparelhos(newAparelhos);
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleTouchStart = (e, index) => {
    touchStartTimer.current = setTimeout(() => {
      setIsDragging(true); dragItem.current = index; currentDragElement.current = e.currentTarget;
      currentDragElement.current?.classList.add('dragging');
    }, 700);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) { if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; } return; }
    e.preventDefault();
    const [touch, targetEl] = [e.touches[0], document.elementFromPoint(touch.clientX, touch.clientY)];
    const hoveredConexionEl = targetEl?.closest('.retanguloAdicionado');
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (hoveredConexionEl) {
      const hoveredIndex = Array.from(hoveredConexionEl.parentNode?.children || []).indexOf(hoveredConexionEl);
      dragOverItem.current = (hoveredIndex !== -1 && hoveredIndex !== dragItem.current) ? hoveredIndex : null;
      if (dragOverItem.current !== null) hoveredConexionEl.classList.add('drag-over');
    } else { dragOverItem.current = null; }
  };

  const handleTouchEnd = () => {
    if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
    if (!isDragging) return;
    currentDragElement.current?.classList.remove('dragging'); currentDragElement.current = null;
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
    const [draggedIdx, droppedIdx] = [dragItem.current, dragOverItem.current];
    if (draggedIdx !== null && droppedIdx !== null && draggedIdx !== droppedIdx) {
      const newAparelhos = [...aparelhos];
      const [draggedItemData] = newAparelhos.splice(draggedIdx, 1);
      newAparelhos.splice(droppedIdx, 0, draggedItemData);
      setAparelhos(newAparelhos);
    }
    dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
  };

  const handleConexionClick = (c, e) => {
    if (isDragging || touchStartTimer.current) return;
    if (c.conectado && (e.target === e.currentTarget || e.target.classList.contains('conexion-text-overlay') || e.target.classList.contains('conexion-icon-overlay'))) {
      updateUiState({ selectedConexion: c });
    }
  };

  const devicesToDisplay = activeList === 'connected' ? aparelhos.filter(c => c.conectado) : aparelhos.filter(c => !c.conectado);

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>{tituloPrincipal}</h1>
      <button className="add-button-styled" onClick={handleAddClick}><span className="plus-icon">+</span> {adicionarAparelho}</button>

      <div className="list-toggle-buttons">
        <span className={`slider-bar ${activeList}`} />
        <button className={`toggle-button connected-btn ${activeList === 'connected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'connected' })}>
          Conectados ({aparelhos.filter(c => c.conectado).length})
        </button>
        <button className={`toggle-button disconnected-btn ${activeList === 'disconnected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'disconnected' })}>
          Desconectados ({aparelhos.filter(c => !c.conectado).length})
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : modoManual ? 'Adicionar Novo Aparelho Manualmente' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {(editingId || modoManual) ? (
              <>
                <input title="Nome do aparelho" type="text" placeholder="Nome do Aparelho" value={newConexion.nome} onChange={(e) => updateUiState({ newConexion: { ...newConexion, nome: e.target.value } })} />
                <div className="icon-picker-styled">
                  <label>{escolherIcone}</label>
                  <div className="icons">
                    {availableIcons.map(icon => (
                      <button key={icon.name} className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`} onClick={() => updateUiState({ newConexion: { ...newConexion, imagem: icon.src }, activeIcon: icon.src })} type="button">
                        <img src={icon.src} alt={icon.name} style={{ width: 30, height: 30 }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className="tipoDoFundoConexao">{escolherCorDefundo}</label>
                  <div className="colors">
                    {availableColors.map(color => (
                      <button key={color} className={`color-option ${activeColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateUiState({ newConexion: { ...newConexion, corFundo: color }, activeColor: color })} type="button" />
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={() => saveConexion(!!editingId)} className="save-button-styled" type="button">{editingId ? 'Salvar Edição' : 'Adicionar Aparelho'}</button>
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
                {isSearchingBluetooth && <p className="connecting-message">{esperaMenuBluetoothAbrir}</p>}
                <div className="form-actions">
                  <button onClick={closeAllModals} className="cancel-button-styled" disabled={isSearchingBluetooth} type="button" title='Ativar | Desativar aparelho'>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="conexions-list">
        {devicesToDisplay.length === 0 ? (
          <div className="placeholder-image-container">
            <br /><br /><br />
            <div className="image-wrapper">
              <img src={semConexao} alt="Nenhum aparelho aqui" className="placeholder-image" />
              <div className="light-effect"></div>
            </div>
            <p className="placeholder-text">
              {activeList === 'connected' ? 'Nenhum aparelho conectado no momento.' : 'Nenhum aparelho desconectado no momento.'}
            </p>
          </div>
        ) : (
          devicesToDisplay.map((c, index) => (
            <div
              key={c.id} className={`retanguloAdicionado ${isDragging && dragItem.current === index ? 'dragging' : ''}`}
              style={{ backgroundColor: c.conectado ? (c.corFundo || '#e0e0e0') : '#696969' }}
              onClick={(e) => handleConexionClick(c, e)} draggable="true"
              onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} onDrop={handleDrop} onDragOver={handleDragOver}
              onTouchStart={(e) => handleTouchStart(e, index)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            >
              {c.conectado && (
                <div className="qrcode-top-left">
                  <button className="qrcode-button" onClick={(e) => { e.stopPropagation(); updateUiState({ visibleQRCode: c }); }} type="button">
                    <img src={imgQrcode} alt="QR Code" className="qrCodeAparelhoConectado" />
                  </button>
                </div>
              )}
              {!c.conectado && <div className="disconnected-overlay">{mensagemAparelhoDesativado}</div>}
              <div className="icon-text-overlay">
                <img src={c.imagem} alt={c.nome} className="conexion-icon-overlay" style={{ opacity: c.conectado ? 1 : 0.5 }} />
                <span className="conexion-text-overlay" style={{ color: c.conectado ? 'inherit' : '#a9a9a9' }}>{c.nome}</span>
              </div>
              <div className="actions-overlay">
                <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }} type="button">×</button>
                <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }} type="button" disabled={!c.conectado}>
                  <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
                </button>
                <label className="switch">
                  <input type="checkbox" checked={c.conectado} onChange={(e) => { e.stopPropagation(); toggleConnection(c.id, e.target.checked); }} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedConexion && (
        <div className="modal-overlay" onClick={() => updateUiState({ selectedConexion: null })}>
          <div className="detalhes-aparelho-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => updateUiState({ selectedConexion: null })}>X</button>
            <h2 title="Detalhes do Aparelho" alt=" Detalhes do Aprelho">{detalhesaparelhoAmpliados}</h2>
            <div className="detalhes-content">
              <img src={selectedConexion.imagem} alt={selectedConexion.nome} className="detalhes-icon" />
              <h3>{selectedConexion.nome}</h3>
              <p>ID do Aparelho: {selectedConexion.id.substring(0, 8)}...</p>
              {selectedConexion.conectado ? (
                <>
                  <p>Status: Conectado</p>
                  <p className="tempo-aparelho-conectado">
                    <span className="info-label">{tempoAparelhoConectado}:</span>
                    <span className="duracao-conexao">{getConnectionDuration(selectedConexion.connectedDate, selectedConexion.accumulatedSeconds)}</span>
                  </p>
                </>
              ) : (
                <>
                  <p>Status: Desconectado</p>
                  <p>Última vez conectado: {formatDate(selectedConexion.connectedDate)}</p>
                </>
              )}
              <div className="detalhes-actions">
                <button className="edit-button-detalhes" onClick={() => handleEditClick(selectedConexion)} disabled={!selectedConexion.conectado}>
                  <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
                  {btnEditar}
                </button>
                <button className="remove-button-detalhes" onClick={() => removeConexion(selectedConexion.id)}>{btnRemover}</button>
                <label className="switch switch-detalhes">
                  <input type="checkbox" checked={selectedConexion.conectado} onChange={(e) => toggleConnection(selectedConexion.id, e.target.checked)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <p className="mensagem-remover-aparelho">{mensagemExcluirAparelho}</p>
            <div className="confirmation-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
              <button onClick={handleCancelRemove} className="cancel-button">Não</button>
            </div>
          </div>
        </div>
      )}

      {visibleQRCode && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="qrcode-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeAllModals}>X</button>
            <h3 className='tituloQrcode'>QR Code para {visibleQRCode.nome}</h3>
            <br />
            <div className="qrCodeAparelho">
              <QRCodeCanvas className='qrcode'
                value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(visibleQRCode.nome)}&icon=${getIconKeyBySrc(visibleQRCode.imagem)}&bgColor=${encodeURIComponent(visibleQRCode.corFundo)}`}
                size={256} id="qrCodeId"
              />
            </div>
            <p className="instrucaoQrcode">Escaneie o QR code para conectar o aparelho.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;