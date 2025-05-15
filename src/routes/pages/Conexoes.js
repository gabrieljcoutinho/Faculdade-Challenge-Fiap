import React, { useState, useEffect } from 'react';
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import lampIcon from '../../imgs/lampada.png';

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '' });
  const [activeIcon, setActiveIcon] = useState('');
  const availableIcons = [
    { name: 'TV', src: tvIcon },
    { name: 'Ar Condicionado', src: airConditionerIcon },
    { name: 'Lâmpada', src: lampIcon },
    // Adicione mais ícones conforme necessário
  ];

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewConexion({ text: '', icon: '' });
    setActiveIcon('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewConexion(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleIconSelect = (iconSrc) => {
    setNewConexion(prevState => ({
      ...prevState,
      icon: iconSrc,
    }));
    setActiveIcon(iconSrc);
  };

  const saveConexion = () => {
    if (newConexion.text && newConexion.icon) {
      setConexions([...conexions, newConexion]);
      setShowAddForm(false);
    } else {
      alert('Por favor, digite um nome e selecione um ícone.');
    }
  };

  const removeConexion = (indexToRemove) => {
    setConexions(conexions.filter((_, index) => index !== indexToRemove));
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
            <h2>Adicionar Novo Aparelho</h2>
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
                Salvar
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
            className="retanguloAdicionado"
            style={{ backgroundColor: conexion.backgroundColor || '#e0e0e0' }}
          >
            <div className="icon-text-overlay">
              <img src={conexion.icon} alt={conexion.text} className="conexion-icon-overlay" />
              <span className="conexion-text-overlay">{conexion.text}</span>
            </div>
            <button
              className="remove-button"
              onClick={() => removeConexion(index)}
            >
              X
            </button>
          </div>
        ))}
        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
};

export default Conexoes;