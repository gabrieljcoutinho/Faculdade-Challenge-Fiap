import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

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

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('conexions'));
      // Garante que cada conexão armazenada tenha uma propriedade connectedDate e um ID único
      return Array.isArray(stored)
        ? stored.map(c => ({
            ...c,
            connectedDate: c.connectedDate || new Date().toISOString(),
            id: c.id || Date.now() + Math.random() // Garante um ID único
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingIndex, setRemovingIndex] = useState(null);
  const [visibleQRCode, setVisibleQRCode] = useState(null);

  const availableIcons = [
    { name: 'TV', src: tvIcon },
    { name: 'Ar Condicionado', src: airConditionerIcon },
    { name: 'Lâmpada', src: lampIcon },
    { name: 'Airfry', src: airfry },
    { name: 'Carregador', src: carregador }
  ];

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aparelhoParaAdicionar = params.get('add');
    if (aparelhoParaAdicionar) {
      const jaExiste = conexions.some(c => c.text.toLowerCase() === aparelhoParaAdicionar.toLowerCase());
      if (!jaExiste) {
        const novo = {
          text: aparelhoParaAdicionar,
          icon: tvIcon,
          backgroundColor: availableColors[0],
          connected: true,
          connectedDate: new Date().toISOString(), // Define a data de conexão
          id: Date.now() + Math.random() // Atribui um ID único
        };
        setConexions(prev => [...prev, novo]);
      }
    }
  }, []); // Adicionado 'conexions' como dependência para garantir que a verificação de existência seja atualizada

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingIndex(null);
    setErrorMessage('');
  };

  const saveConexion = () => {
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Para adicionar um aparelho, você precisa dar um nome e escolher um ícone para ele, tá? 😉');
      return;
    }
    if (conexions.some((c, i) => c.text.toLowerCase() === newConexion.text.toLowerCase() && i !== editingIndex)) {
      setErrorMessage(`Hummm, parece que já temos um aparelho chamado "${newConexion.text}" por aqui. Que tal escolher outro nome? 😊`);
      return;
    }

    if (editingIndex !== null) {
      const updated = [...conexions];
      updated[editingIndex] = { ...newConexion, connectedDate: updated[editingIndex].connectedDate || new Date().toISOString() }; // Preserva a data original ou define uma nova se não houver
      setConexions(updated);
    } else {
      // Adiciona um ID único ao novo aparelho
      const newConexionWithId = { ...newConexion, connectedDate: new Date().toISOString(), id: Date.now() + Math.random() };
      setConexions([...conexions, newConexionWithId]);
    }
    setShowAddForm(false);
  };

  const removeConexion = (index) => {
    if (conexions[index].connected) {
      setRemovingIndex(index);
      setTimeout(() => {
        setConexions((prev) => prev.filter((_, i) => i !== index));
        setRemovingIndex(null);
      }, 300);
    }
  };

  const handleEditClick = (index) => {
    if (conexions[index].connected) {
      const c = conexions[index];
      setNewConexion({
        text: c.text,
        icon: c.icon,
        backgroundColor: c.backgroundColor || availableColors[0],
        connected: c.connected !== undefined ? c.connected : true,
        connectedDate: c.connectedDate || new Date().toISOString()
      });
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setShowAddForm(true);
      setEditingIndex(index);
      setErrorMessage('');
    }
  };

  const toggleConnection = (index) => {
    setConexions(conexions.map((c, i) =>
      i === index
        ? { ...c, connected: !c.connected, connectedDate: !c.connected ? new Date().toISOString() : c.connectedDate } // Atualiza a data se for conectar
        : c
    ));
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
            <h2>{editingIndex !== null ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
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
                {editingIndex !== null ? 'Salvar Edição' : 'Salvar'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((c, index) => {
          const isRemoving = removingIndex === index;

          return (
            <div
              key={c.id} // Usando o ID único como chave, o que é mais robusto
              className={`retanguloAdicionado ${isRemoving ? 'exiting' : ''}`}
              style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            >
              {c.connected && (
                <div className="qrcode-top-left">
                  <button
                    className="qrcode-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleQRCode(index);
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
                  onClick={(e) => { e.stopPropagation(); removeConexion(index); }} // Para a propagação
                  title="Remover"
                  disabled={!c.connected}
                  style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                >X</button>

                <button
                  className="edit-button"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(index); }} // Para a propagação
                  title="Editar"
                  disabled={!c.connected}
                  style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                >
                  <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
                </button>

                <div className="switch-container" onClick={(e) => e.stopPropagation()}> {/* Para a propagação */}
                  <label className="switch">
                    <input type="checkbox" checked={c.connected} onChange={() => toggleConnection(index)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: '60px' }}></div>
      </div>

      {visibleQRCode !== null && (
        <div className="qrcode-overlay">
          <button className="close-qrcode" onClick={() => setVisibleQRCode(null)}>X</button>
          <QRCodeCanvas
            value={`https://challenge-fiap-nine.vercel.app/conexoes?add=${encodeURIComponent(conexions[visibleQRCode].text)}`}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            imageSettings={{
              src: conexions[visibleQRCode].icon,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Conexoes;