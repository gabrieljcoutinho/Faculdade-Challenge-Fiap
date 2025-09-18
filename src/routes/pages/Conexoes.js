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
import '../../CSS/Conexao/detalhesAparelhos.css';
import '../../CSS/Conexao/imgNaoConectado.css';
import '../../CSS/Conexao/mensagemRemoverAparelho.css';
import '../../CSS/Conexao/mensagemMuitosAprelhosConectadosAoMesmoTempo.css';
import '../../CSS/Conexao/btnConectadoEnaoConectado.css';
import '../../CSS/Conexao/marcadorDeConsumo.css';
import '../../CSS/Conexao/luzPelaImgNaoConectado.css';
import '../../CSS/Conexao/iconeBateriaEcabo.css';

import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';
import editIcon from '../../imgs/imgConexao/pencil.png';
import imgQrcode from '../../imgs/imgConexao/qrCode.png';
import semConexao from '../../imgs/imgConexao/semConexao.png';
import bluetoothIcon from '../../imgs/imgConexao/bluetooth.png';
import manual from '../../imgs/imgConexao/manual.png';
import caboIcon from '../../imgs/imgConexao/cabo.png';
import bateriaIcon from '../../imgs/imgConexao/bateria.png';

import {
  tituloPrincipal, adicionarAparelho, escolherIcone, escolherCorDefundo, btnBluetooth,
  procurarAparelhosBluetooth, adicicionarAparelhoManualmente, esperaMenuBluetoothAbrir,
  mensagemAparelhoDesativado, detalhesaparelhoAmpliados, mensagemExcluirAparelho,
  btnEditar, btnRemover, tempoAparelhoConectado
} from '../../constants/Conexao/index.js';

const [siteBaseURL, availableColors, availableIcons, connectionIcons] = [
  "https://challenge-fiap-nine.vercel.app",
  ['#FFFFF0', '#FFFFE0', '#E0FFFF', '#F0FFF0', '#F5FFFA', '#FFFACD', '#F0FFFF', '#FFFAF0', '#F8F8FF'],
  [{ name: 'tv', src: tvIcon }, { name: 'arcondicionado', src: airConditionerIcon }, { name: 'lampada', src: lampIcon }, { name: 'geladeira', src: geladeira }, { name: 'carregador', src: carregador }],
  [{ name: 'cabo', src: caboIcon }, { name: 'bateria', src: bateriaIcon }],
];
const iconMap = availableIcons.reduce((acc, icon) => ({ ...acc, [icon.name]: icon.src }), {});

const Conexoes = ({ aparelhos, setAparelhos, onConnectDevice, onRemoveDevice, onConnectionTypeChange, activeConnectionIcon }) => {
  const { search, pathname } = useLocation();
  const [uiState, setUiState] = useState({ showAddForm: false, modoManual: false, isSearchingBluetooth: false, errorMessage: '', showConfirmDialog: false, visibleQRCode: null, selectedConexion: null, activeList: 'connected', newConexion: { nome: '', imagem: '', corFundo: availableColors[0] }, activeIcon: null, activeColor: availableColors[0], editingId: null, conexionToDelete: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef(null), dragOverItem = useRef(null), touchStartTimer = useRef(null), currentDragElement = useRef(null);

  // Novos estados para a corrente e tensão
  const [voltage, setVoltage] = useState('127V');
  const [current, setCurrent] = useState('3A');

  const updateUiState = newState => setUiState(prev => ({ ...prev, ...newState }));
  const getIconKeyBySrc = src => availableIcons.find(icon => icon.src === src)?.name || '';
  const formatDate = d => d ? new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const closeAllModals = useCallback(() => {
    updateUiState({ showAddForm: false, modoManual: false, errorMessage: '', isSearchingBluetooth: false, showConfirmDialog: false, visibleQRCode: null, selectedConexion: null, newConexion: { nome: '', imagem: '', corFundo: availableColors[0] }, activeIcon: null, activeColor: availableColors[0], editingId: null, conexionToDelete: null });
    if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
    setIsDragging(false);
    if (currentDragElement.current) { currentDragElement.current.classList.remove('dragging'); currentDragElement.current = null; }
    document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
  }, []);

  // Novo useEffect para atualizar a corrente e tensão
  useEffect(() => {
    const interval = setInterval(() => {
      // Valores aleatórios para simular mudanças
      const newVoltage = (Math.random() * (130 - 120) + 120).toFixed(1) + 'V';
      const newCurrent = (Math.random() * (3.5 - 2.5) + 2.5).toFixed(1) + 'A';
      setVoltage(newVoltage);
      setCurrent(newCurrent);
    }, 1000); // Atualiza a cada segundo
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const [nome, iconKey, bgColor] = [params.get('add'), params.get('icon'), params.get('bgColor')];
    if (nome && iconKey) {
      const iconSrc = iconMap[iconKey];
      const actualBgColor = availableColors.includes(bgColor) ? bgColor : availableColors[0];
      if (iconSrc && !aparelhos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
        onConnectDevice(nome, iconSrc, actualBgColor);
      } else if (iconSrc) {
        updateUiState({ errorMessage: `Já existe um aparelho chamado "${nome}".` });
      }
      window.history.replaceState({}, document.title, pathname);
    }
  }, [search, onConnectDevice, aparelhos, pathname]);

  useEffect(() => {
    const timers = aparelhos.reduce((acc, c) => {
      if (c.conectado && c.connectedDate) {
        acc[c.id] = setInterval(() => setAparelhos(prev => prev.map(dev => (dev.id === c.id ? { ...dev, accumulatedSeconds: (dev.accumulatedSeconds || 0) + 1 } : dev))), 1000);
      }
      return acc;
    }, {});
    return () => Object.values(timers).forEach(clearInterval);
  }, [aparelhos, setAparelhos]);

  const toggleConnectionIcon = () => onConnectionTypeChange(connectionIcons[(connectionIcons.findIndex(icon => icon.name === activeConnectionIcon) + 1) % connectionIcons.length].name);
  const handleAddClick = () => updateUiState({ showAddForm: true, modoManual: false, isSearchingBluetooth: false, newConexion: { nome: '', imagem: '', corFundo: availableColors[0] }, activeIcon: null, activeColor: availableColors[0], editingId: null, errorMessage: '' });
  const abrirModoManual = () => updateUiState({ modoManual: true, isSearchingBluetooth: false });
  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) { updateUiState({ errorMessage: 'Seu navegador não suporta Web Bluetooth.', isSearchingBluetooth: false }); return; }
    updateUiState({ isSearchingBluetooth: true, errorMessage: '' });
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      if (!device) { updateUiState({ errorMessage: 'Nenhum aparelho Bluetooth selecionado.', isSearchingBluetooth: false }); return; }
      const deviceName = device.name || 'Dispositivo Desconhecido';
      if (aparelhos.some(c => c.nome.toLowerCase() === deviceName.toLowerCase())) { updateUiState({ errorMessage: `Já existe um aparelho chamado "${deviceName}".`, isSearchingBluetooth: false }); return; }
      const guessedIcon = (name => name.includes('tv') ? tvIcon : name.includes('ar') ? airConditionerIcon : name.includes('geladeira') ? geladeira : name.includes('carregador') ? carregador : lampIcon)(deviceName.toLowerCase());
      onConnectDevice(deviceName, guessedIcon, availableColors[0]);
      closeAllModals();
    } catch (error) { updateUiState({ errorMessage: error.name === 'NotFoundError' ? 'Nenhum aparelho encontrado.' : error.name === 'NotAllowedError' ? 'Permissão negada.' : 'Falha na conexão Bluetooth.', isSearchingBluetooth: false }); }
  };
  const saveConexion = useCallback(isEdit => {
    if (!uiState.newConexion.nome.trim() || !uiState.newConexion.imagem) { updateUiState({ errorMessage: 'Dê um nome e selecione um ícone.' }); return; }
    if (aparelhos.some(c => c.nome.toLowerCase() === uiState.newConexion.nome.toLowerCase() && (!isEdit || c.id !== uiState.editingId))) { updateUiState({ errorMessage: `Já existe um aparelho com o nome "${uiState.newConexion.nome}".` }); return; }
    if (isEdit) {
      setAparelhos(prev => prev.map(c => c.id === uiState.editingId ? { ...c, nome: uiState.newConexion.nome, imagem: uiState.newConexion.imagem, corFundo: uiState.newConexion.corFundo } : c));
    } else {
      onConnectDevice(uiState.newConexion.nome, uiState.newConexion.imagem, uiState.newConexion.corFundo);
    }
    closeAllModals();
  }, [aparelhos, uiState.newConexion, uiState.editingId, onConnectDevice, setAparelhos, closeAllModals]);

  const handleEditClick = c => c.conectado && updateUiState({ showAddForm: true, modoManual: true, newConexion: { nome: c.nome, imagem: c.imagem, corFundo: c.corFundo || availableColors[0] }, activeIcon: c.imagem, activeColor: c.corFundo || availableColors[0], editingId: c.id, errorMessage: '', selectedConexion: null });
  const removeConexion = id => updateUiState({ conexionToDelete: id, showConfirmDialog: true });
  const handleConfirmRemove = () => { onRemoveDevice(uiState.conexionToDelete); closeAllModals(); };
  const handleConexionClick = (c, e) => !isDragging && !touchStartTimer.current && c.conectado && (e.target === e.currentTarget || e.target.classList.contains('conexion-text-overlay') || e.target.classList.contains('conexion-icon-overlay')) && updateUiState({ selectedConexion: c });
  const toggleConnection = useCallback((id, newDesiredState) => setAparelhos(prev => prev.map(c => {
    if (c.id !== id) return c;
    const [now, connectedStartTime] = [new Date().getTime(), new Date(c.connectedDate).getTime()];
    return newDesiredState ? { ...c, conectado: true, connectedDate: new Date().toISOString() } : { ...c, conectado: false, accumulatedSeconds: (c.accumulatedSeconds || 0) + (now - connectedStartTime) / 1000, connectedDate: null };
  })), [setAparelhos]);

  const getConnectionDuration = (connectedDate, accumulatedSeconds = 0) => {
    let totalSeconds = accumulatedSeconds || 0;
    if (connectedDate) totalSeconds += (new Date().getTime() - new Date(connectedDate).getTime()) / 1000;
    if (totalSeconds <= 0) return 'Menos de um segundo';
    const [s, m, h, d] = [Math.floor(totalSeconds) % 60, Math.floor(totalSeconds / 60) % 60, Math.floor(totalSeconds / 3600) % 24, Math.floor(totalSeconds / 86400)];
    return [d > 0 && `${d} dia(s)`, h > 0 && `${h} hora(s)`, m > 0 && `${m} minuto(s)`, s > 0 && `${s} segundo(s)`].filter(Boolean).join(' e ') || 'Menos de um segundo';
  };

  const [handleDragStart, handleDragEnter, handleDragLeave, handleDragEnd, handleDrop, handleDragOver, handleTouchStart, handleTouchMove, handleTouchEnd] = [
    (e, idx) => { dragItem.current = idx; currentDragElement.current = e.currentTarget; setTimeout(() => currentDragElement.current?.classList.add('dragging'), 0); setIsDragging(true); e.dataTransfer.setData('text/plain', idx); e.dataTransfer.effectAllowed = 'move'; },
    (e, idx) => { if (dragItem.current !== null && dragItem.current !== idx) { dragOverItem.current = idx; e.currentTarget.classList.add('drag-over'); } },
    e => e.currentTarget.classList.remove('drag-over'),
    () => { currentDragElement.current?.classList.remove('dragging'); currentDragElement.current = null; document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over')); dragItem.current = null; dragOverItem.current = null; setIsDragging(false); },
    e => {
      e.preventDefault(); e.currentTarget?.classList.remove('drag-over');
      const [draggedIdx, droppedIdx] = [dragItem.current, dragOverItem.current];
      if (draggedIdx !== null && droppedIdx !== null && draggedIdx !== droppedIdx) { const newAparelhos = [...aparelhos]; const [draggedItemData] = newAparelhos.splice(draggedIdx, 1); newAparelhos.splice(droppedIdx, 0, draggedItemData); setAparelhos(newAparelhos); }
      handleDragEnd();
    },
    e => e.preventDefault(),
    (e, idx) => touchStartTimer.current = setTimeout(() => { setIsDragging(true); dragItem.current = idx; currentDragElement.current = e.currentTarget; currentDragElement.current?.classList.add('dragging'); }, 700),
    e => {
      if (!isDragging) { if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; } return; }
      e.preventDefault();
      const [touch, targetEl] = [e.touches[0], document.elementFromPoint(touch.clientX, touch.clientY)];
      const hoveredConexionEl = targetEl?.closest('.retanguloAdicionado');
      document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
      if (hoveredConexionEl) { const hoveredIndex = Array.from(hoveredConexionEl.parentNode?.children || []).indexOf(hoveredConexionEl); dragOverItem.current = (hoveredIndex !== -1 && hoveredIndex !== dragItem.current) ? hoveredIndex : null; if (dragOverItem.current !== null) hoveredConexionEl.classList.add('drag-over'); } else { dragOverItem.current = null; }
    },
    () => {
      if (touchStartTimer.current) { clearTimeout(touchStartTimer.current); touchStartTimer.current = null; }
      if (!isDragging) return;
      currentDragElement.current?.classList.remove('dragging'); currentDragElement.current = null;
      document.querySelectorAll('.retanguloAdicionado.drag-over').forEach(el => el.classList.remove('drag-over'));
      const [draggedIdx, droppedIdx] = [dragItem.current, dragOverItem.current];
      if (draggedIdx !== null && droppedIdx !== null && draggedIdx !== droppedIdx) { const newAparelhos = [...aparelhos]; const [draggedItemData] = newAparelhos.splice(draggedIdx, 1); newAparelhos.splice(droppedIdx, 0, draggedItemData); setAparelhos(newAparelhos); }
      dragItem.current = null; dragOverItem.current = null; setIsDragging(false);
    }
  ];

  const devicesToDisplay = aparelhos.filter(c => c.conectado === (uiState.activeList === 'connected'));
  const currentConnectionIconSrc = connectionIcons.find(icon => icon.name === activeConnectionIcon)?.src;

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>{tituloPrincipal}</h1>
      <div className="add-button-container">
        <button className="add-button-styled" onClick={handleAddClick}><span className="plus-icon">+</span> {adicionarAparelho}</button>
        {currentConnectionIconSrc && (<button className="icon-connection-button" onClick={toggleConnectionIcon}><img src={currentConnectionIconSrc} alt={activeConnectionIcon} /></button>)}
      </div>
      <div className="list-toggle-buttons">
        <span className={`slider-bar ${uiState.activeList}`} />
        <button className={`toggle-button connected-btn ${uiState.activeList === 'connected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'connected' })}>Conectados ({aparelhos.filter(c => c.conectado).length})</button>
        <button className={`toggle-button disconnected-btn ${uiState.activeList === 'disconnected' ? 'active' : ''}`} onClick={() => updateUiState({ activeList: 'disconnected' })}>Desconectados ({aparelhos.filter(c => !c.conectado).length})</button>
      </div>

      {uiState.showAddForm && (<div className="modal-overlay">
        <div className="add-form-styled">
          <h2>{uiState.editingId ? 'Editar Aparelho' : uiState.modoManual ? 'Adicionar Novo Aparelho Manualmente' : 'Adicionar Novo Aparelho'}</h2>
          {uiState.errorMessage && <p className="error-message">{uiState.errorMessage}</p>}
          {(uiState.editingId || uiState.modoManual) ? (<><input title="Nome do aparelho" type="text" placeholder="Nome do Aparelho" value={uiState.newConexion.nome} onChange={e => updateUiState({ newConexion: { ...uiState.newConexion, nome: e.target.value } })} />
            <div className="icon-picker-styled"><label>{escolherIcone}</label><div className="icons">{availableIcons.map(icon => (<button key={icon.name} className={`icon-option ${uiState.activeIcon === icon.src ? 'active' : ''}`} onClick={() => updateUiState({ newConexion: { ...uiState.newConexion, imagem: icon.src }, activeIcon: icon.src })} type="button"><img src={icon.src} alt={icon.name} style={{ width: 30, height: 30 }} /></button>))}</div></div>
            <div className="color-picker-styled"><label className="tipoDoFundoConexao">{escolherCorDefundo}</label><div className="colors">{availableColors.map(color => (<button key={color} className={`color-option ${uiState.activeColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateUiState({ newConexion: { ...uiState.newConexion, corFundo: color }, activeColor: color })} type="button" />))}</div></div>
            <div className="form-actions"><button onClick={() => saveConexion(!!uiState.editingId)} className="save-button-styled" type="button">{uiState.editingId ? 'Salvar Edição' : 'Adicionar Aparelho'}</button><button onClick={closeAllModals} className="cancel-button-styled" type="button">Cancelar</button></div>
          </>) : (<><p className='paragrafoAdiconarAparelhos'>{btnBluetooth}</p>
            <button onClick={handleSearchAndConnectBluetooth} className="add-button-styled" disabled={uiState.isSearchingBluetooth} type="button">{uiState.isSearchingBluetooth ? 'Procurando Aparelhos Bluetooth' : (<><img src={bluetoothIcon} title="Procurar" alt="Bluetooth" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />{procurarAparelhosBluetooth}</>)}</button>
            <button onClick={abrirModoManual} className="add-button-styled" style={{ marginTop: '10px' }} disabled={uiState.isSearchingBluetooth} type="button"><img src={manual} alt="Bluetooth" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />{adicicionarAparelhoManualmente}</button>
            {uiState.isSearchingBluetooth && <p className="connecting-message">{esperaMenuBluetoothAbrir}</p>}
            <div className="form-actions"><button onClick={closeAllModals} className="cancel-button-styled" disabled={uiState.isSearchingBluetooth} type="button" title='Ativar | Desativar aparelho'>Cancelar</button></div></>)}
        </div>
      </div>)}

      <div className="conexions-list">
        {devicesToDisplay.length === 0 ? (<div className="placeholder-image-container"><br /><br /><br /><div className="image-wrapper"><img src={semConexao} alt="Nenhum aparelho aqui" className="placeholder-image" /><div className="light-effect"></div></div><p className="placeholder-text">{uiState.activeList === 'connected' ? 'Nenhum aparelho conectado no momento.' : 'Nenhum aparelho desconectado no momento.'}</p></div>) : (
          devicesToDisplay.map((c, index) => (<div key={c.id} className={`retanguloAdicionado ${isDragging && dragItem.current === index ? 'dragging' : ''}`} style={{ backgroundColor: c.conectado ? (c.corFundo || '#e0e0e0') : '#696969' }} onClick={e => handleConexionClick(c, e)} draggable="true" onDragStart={e => handleDragStart(e, index)} onDragEnter={e => handleDragEnter(e, index)} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} onDrop={handleDrop} onDragOver={handleDragOver} onTouchStart={e => handleTouchStart(e, index)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {c.conectado && (<div className="qrcode-top-left"><button className="qrcode-button" onClick={e => { e.stopPropagation(); updateUiState({ visibleQRCode: c }); }} type="button"><img src={imgQrcode} alt="QR Code" className="qrCodeAparelhoConectado" /></button></div>)}
            {!c.conectado && <div className="disconnected-overlay">{mensagemAparelhoDesativado}</div>}

            <div className="content-container">
              <div className="icon-text-overlay">
                <img src={c.imagem} alt={c.nome} className="conexion-icon-overlay" style={{ opacity: c.conectado ? 1 : 0.5 }} />
                <span className="conexion-text-overlay" style={{ color: c.conectado ? 'inherit' : '#a9a9a9' }}>{c.nome}</span>
              </div>
              {c.conectado && (
                <div className="current-voltage-meter">
                  <p className="voltage-display">V: {voltage}</p>
                  <p className="current-display">A: {current}</p>
                </div>
              )}
            </div>

            <div className="actions-overlay"><button className="remove-button" onClick={e => { e.stopPropagation(); removeConexion(c.id); }} type="button">×</button><button className="edit-button" onClick={e => { e.stopPropagation(); handleEditClick(c); }} type="button" disabled={!c.conectado}><img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} /></button>
              <label className="switch"><input type="checkbox" checked={c.conectado} onChange={e => { e.stopPropagation(); toggleConnection(c.id, e.target.checked); }} /><span className="slider round"></span></label>
            </div>
          </div>))
        )}
      </div>

      {uiState.selectedConexion && (<div className="modal-overlay" onClick={() => updateUiState({ selectedConexion: null })}><div className="detalhes-aparelho-modal" onClick={e => e.stopPropagation()}><button className="close-button" onClick={() => updateUiState({ selectedConexion: null })}>X</button><h2 title="Detalhes do Aparelho" alt=" Detalhes do Aprelho">{detalhesaparelhoAmpliados}</h2><div className="detalhes-content"><img src={uiState.selectedConexion.imagem} alt={uiState.selectedConexion.nome} className="detalhes-icon" /><h3>{uiState.selectedConexion.nome}</h3><p>ID do Aparelho: {uiState.selectedConexion.id.substring(0, 8)}...</p>
          {uiState.selectedConexion.conectado ? (<><p>Status: Conectado</p><p className="tempo-aparelho-conectado"><span className="info-label">{tempoAparelhoConectado}:</span><span className="duracao-conexao">{getConnectionDuration(uiState.selectedConexion.connectedDate, uiState.selectedConexion.accumulatedSeconds)}</span></p></>) : (<><p>Status: Desconectado</p><p>Última vez conectado: {formatDate(uiState.selectedConexion.connectedDate)}</p></>)}
          <div className="detalhes-actions"><button className="edit-button-detalhes" onClick={() => handleEditClick(uiState.selectedConexion)} disabled={!uiState.selectedConexion.conectado}><img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />{btnEditar}</button>
            <button className="remove-button-detalhes" onClick={() => removeConexion(uiState.selectedConexion.id)}>{btnRemover}</button><label className="switch switch-detalhes"><input type="checkbox" checked={uiState.selectedConexion.conectado} onChange={e => toggleConnection(uiState.selectedConexion.id, e.target.checked)} /><span className="slider round"></span></label>
          </div></div></div></div>)}

      {uiState.showConfirmDialog && (<div className="modal-overlay"><div className="confirmation-dialog"><p className="mensagem-remover-aparelho">{mensagemExcluirAparelho}</p><div className="confirmation-actions"><button onClick={handleConfirmRemove} className="confirm-button">Sim</button><button onClick={closeAllModals} className="cancel-button">Não</button></div></div></div>)}
      {uiState.visibleQRCode && (<div className="modal-overlay" onClick={closeAllModals}><div className="qrcode-modal" onClick={e => e.stopPropagation()}><button className="close-button" onClick={closeAllModals}>X</button><h3 className='tituloQrcode'>QR Code para {uiState.visibleQRCode.nome}</h3><br /><div className="qrCodeAparelho"><QRCodeCanvas className='qrcode' value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(uiState.visibleQRCode.nome)}&icon=${getIconKeyBySrc(uiState.visibleQRCode.imagem)}&bgColor=${encodeURIComponent(uiState.visibleQRCode.corFundo)}`} size={256} id="qrCodeId" /></div><p className="instrucaoQrcode">Escaneie o QR code para conectar o aparelho.</p></div></div>)}
    </div>
  );
};

export default Conexoes;