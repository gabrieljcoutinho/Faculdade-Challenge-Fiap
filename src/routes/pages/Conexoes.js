import React, { useState, useEffect } from 'react';
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import '../../CSS/Conexao/edit.css';
import '../../CSS/Conexao/saveBtn.css';
import '../../CSS/Conexao/icon.css';
import '../../CSS/Conexao/adicionar.css';
import '../../CSS/Conexao/slideIn.css'
import '../../CSS/Conexao/slideOut.css';

import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import lampIcon from '../../imgs/lampada.png';
import editIcon from '../../imgs/pencil.png';

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '' });
  const [activeIcon, setActiveIcon] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingIndex, setRemovingIndex] = useState(null);
  const [enteringIndex, setEnteringIndex] = useState(null); // Novo estado para controlar a animação de entrada
  const availableIcons = [
    { name: 'TV', src: tvIcon },
    { name: 'Ar Condicionado', src: airConditionerIcon },
    { name: 'Lâmpada', src: lampIcon },
  ];

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewConexion({ text: '', icon: '' });
    setActiveIcon('');
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
      setEnteringIndex(newIndex); // Define o índice do novo item para a animação
      setTimeout(() => {
        setEnteringIndex(null); // Limpa o índice após a animação
      }, 300); // A duração deve corresponder à transição CSS (0.3s)
    }
    setShowAddForm(false);
    setErrorMessage('');
  };

  const removeConexion = (indexToRemove) => {
    setRemovingIndex(indexToRemove);
    setTimeout(() => {
      setConexions(conexions.filter((_, index) => index !== indexToRemove));
      setRemovingIndex(null);
    }, 300);
  };

  const handleEditClick = (index) => {
    const conexionToEdit = conexions[index];
    setNewConexion({ text: conexionToEdit.text, icon: conexionToEdit.icon });
    setActiveIcon(conexionToEdit.icon);
    setShowAddForm(true);
    setEditingIndex(index);
    setErrorMessage('');
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
            className={`retanguloAdicionado ${removingIndex === index ? 'exiting' : ''} ${enteringIndex === index ? 'entering' : (enteringIndex < index ? 'entered' : '')}`}
            style={{ backgroundColor: conexion.backgroundColor || '#e0e0e0' }}
          >
            <div className="icon-text-overlay">
              <img src={conexion.icon} alt={conexion.text} className="conexion-icon-overlay" />
              <span className="conexion-text-overlay">{conexion.text}</span>
            </div>
            <div className="actions-overlay">
              <button
                className="remove-button"
                onClick={() => removeConexion(index)}
                title="Remover"
              >
                X
              </button>
              <button className="edit-button" onClick={() => handleEditClick(index)} title="Editar">
                <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        ))}
        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
};

export default Conexoes;