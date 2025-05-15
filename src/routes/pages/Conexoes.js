import React, { useState, useEffect } from 'react';
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import lampIcon from '../../imgs/lampada.png';
import editIcon from '../../imgs/pencil.png'; // Importe o ícone de lápis

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConexion, setNewConexion] = useState({ text: '', icon: '' });
  const [activeIcon, setActiveIcon] = useState('');
  const [editingIndex, setEditingIndex] = useState(null); // Novo estado para rastrear o item sendo editado
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
    setEditingIndex(null); // Reseta o índice de edição ao adicionar um novo
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
      if (editingIndex !== null) {
        // Se estiver editando, atualize o item existente
        const updatedConexions = [...conexions];
        updatedConexions[editingIndex] = newConexion;
        setConexions(updatedConexions);
        setEditingIndex(null);
      } else {
        // Se não estiver editando, adicione um novo item
        setConexions([...conexions, newConexion]);
      }
      setShowAddForm(false);
    } else {
      alert('Por favor, digite um nome e selecione um ícone.');
    }
  };

  const removeConexion = (indexToRemove) => {
    setConexions(conexions.filter((_, index) => index !== indexToRemove));
  };

  const handleEditClick = (index) => {
    const conexionToEdit = conexions[index];
    setNewConexion({ text: conexionToEdit.text, icon: conexionToEdit.icon });
    setActiveIcon(conexionToEdit.icon);
    setShowAddForm(true);
    setEditingIndex(index);
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
            className="retanguloAdicionado"
            style={{ backgroundColor: conexion.backgroundColor || '#e0e0e0' }}
          >
            <div className="icon-text-overlay">
              <img src={conexion.icon} alt={conexion.text} className="conexion-icon-overlay" />
              <span className="conexion-text-overlay">{conexion.text}</span>
            </div>
            <div className="actions-overlay"> {/* Container para os botões de ação */}
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