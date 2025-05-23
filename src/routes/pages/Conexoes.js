import React, { useState, useEffect } from 'react';
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import '../../CSS/Conexao/edit.css';
import '../../CSS/Conexao/saveBtn.css';
import '../../CSS/Conexao/icon.css';
import '../../CSS/Conexao/adicionar.css';
import '../../CSS/Conexao/slideIn.css'
import '../../CSS/Conexao/slideOut.css';
import '../../CSS/Conexao/error.css';
import '../../CSS/Conexao/escolherFundo.css';
import '../../CSS/Conexao/botaoSwitch.css';

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png'
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png'
import editIcon from '../../imgs/pencil.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6','#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true });
  const [activeIcon, setActiveIcon] = useState('');
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingIndex, setRemovingIndex] = useState(null);
  const [enteringIndex, setEnteringIndex] = useState(null);

  const availableIcons = [
    { name: 'TV', src: tvIcon },
    { name: 'Ar Condicionado', src: airConditionerIcon },
    { name: 'Lâmpada', src: lampIcon },
    { name: 'Arfry', src: airfry},
    {name: 'Carregador', src: carregador}
  ];

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true });
    setActiveIcon('');
    setActiveColor(availableColors[0]);
    setEditingIndex(null);
    setErrorMessage('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewConexion(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleIconSelect = (iconSrc) => {
    setNewConexion(prevState => ({
      ...prevState,
      icon: iconSrc,
    }));
    setActiveIcon(iconSrc);
  };

  const handleColorSelect = (color) => {
    setNewConexion(prevState => ({
      ...prevState,
      backgroundColor: color,
    }));
    setActiveColor(color);
  };

  const saveConexion = () => {
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Para adicionar um aparelho, você precisa dar um nome e escolher um ícone para ele, tá? 😉');
      return;
    }

    const isDuplicate = conexions.some((conexion, index) =>
      conexion.text.toLowerCase() === newConexion.text.toLowerCase() && index !== editingIndex
    );

    if (isDuplicate) {
      setErrorMessage(`Hummm, parece que já temos um aparelho chamado "${newConexion.text}" por aqui. Que tal escolher outro nome? 😊`);
      return;
    }

    if (editingIndex !== null) {
      const updatedConexions = [...conexions];
      updatedConexions[editingIndex] = newConexion;
      setConexions(updatedConexions);
      setEditingIndex(null);
    } else {
      const newIndex = conexions.length;
      setConexions([...conexions, newConexion]);
      setEnteringIndex(newIndex);
      setTimeout(() => {
        setEnteringIndex(null);
      }, 300);
    }
    setShowAddForm(false);
    setErrorMessage('');
  };

  const removeConexion = (indexToRemove) => {
    if (!conexions[indexToRemove].connected) {
      return;
    }
    setRemovingIndex(indexToRemove);
    setTimeout(() => {
      setConexions(conexions.filter((_, index) => index !== indexToRemove));
      setRemovingIndex(null);
    }, 300);
  };

  const handleEditClick = (index) => {
    if (!conexions[index].connected) {
      return;
    }
    const conexionToEdit = conexions[index];
    setNewConexion({
      text: conexionToEdit.text,
      icon: conexionToEdit.icon,
      backgroundColor: conexionToEdit.backgroundColor || availableColors[0],
      connected: conexionToEdit.connected !== undefined ? conexionToEdit.connected : true,
    });
    setActiveIcon(conexionToEdit.icon);
    setActiveColor(conexionToEdit.backgroundColor || availableColors[0]);
    setShowAddForm(true);
    setEditingIndex(index);
    setErrorMessage('');
  };

  const toggleConnection = (index) => {
    const updatedConexions = conexions.map((conexion, i) =>
      i === index ? { ...conexion, connected: !conexion.connected } : conexion
    );
    setConexions(updatedConexions);
  };

  return (
    <div className="conexao-container">
      <h1>Aparelhos conectados</h1>
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
              name="text"
              placeholder="Nome do Aparelho"
              value={newConexion.text}
              onChange={handleInputChange}
            />
            <div className="icon-picker-styled">
              <label>Escolha o ícone:</label>
              <div className="icons">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.name}
                    className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                    onClick={() => handleIconSelect(icon.src)}
                    title={icon.name}
                  >
                    <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="color-picker-styled">
              <label>Escolha a cor de fundo:</label>
              <div className="colors">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${activeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  ></button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button onClick={saveConexion} className="save-button-styled">
                {editingIndex !== null ? 'Salvar Edição' : 'Salvar'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((conexion, index) => (
          <div
            key={index}
            className={`retanguloAdicionado ${removingIndex === index ? 'exiting' : ''} ${enteringIndex === index ? 'entering' : (enteringIndex < index ? 'entered' : '')} relative`}
            style={{ backgroundColor: conexion.connected ? (conexion.backgroundColor || '#e0e0e0') : '#696969' }}
          >
            {!conexion.connected && (
              <div className="disconnected-overlay">
               Desativado
              </div>
            )}
            <div className="icon-text-overlay">
              <img
                src={conexion.icon}
                alt={conexion.text}
                className="conexion-icon-overlay"
                style={{ opacity: conexion.connected ? 1 : 0.5 }}
              />
              <span className="conexion-text-overlay" style={{ color: conexion.connected ? 'inherit' : '#a9a9a9' }}>
                {conexion.text}
              </span>
            </div>
            <div className="actions-overlay">
              <button
                className="remove-button"
                onClick={() => removeConexion(index)}
                title="Remover"
                disabled={!conexion.connected}
                style={{ cursor: !conexion.connected ? 'not-allowed' : 'pointer', opacity: !conexion.connected ? 0.5 : 1 }}
              >
                X
              </button>
              <button
                className="edit-button"
                onClick={() => handleEditClick(index)}
                title="Editar"
                disabled={!conexion.connected}
                style={{ cursor: !conexion.connected ? 'not-allowed' : 'pointer', opacity: !conexion.connected ? 0.5 : 1 }}
              >
                <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
              </button>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={conexion.connected}
                    onChange={() => toggleConnection(index)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
};

export default Conexoes;