import React, { useState, useEffect } from 'react';
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
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';

const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];

// Conexoes agora recebe 'conexions' e 'setConexions' como props do App.js
const Conexoes = ({ conexions, setConexions }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  // Garante que newConexion também tem um ID ao ser criado no formulário
  const [newConexion, setNewConexion] = useState({ id: '', text: '', icon: '', backgroundColor: availableColors[0], connected: true });
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
    { name: 'Airfry', src: airfry },
    { name: 'Carregador', src: carregador }
  ];

  const handleAddClick = () => {
    setShowAddForm(true);
    // Gera um novo ID ao iniciar o formulário de adição
    setNewConexion({ id: crypto.randomUUID(), text: '', icon: '', backgroundColor: availableColors[0], connected: true });
    setActiveIcon('');
    setActiveColor(availableColors[0]);
    setEditingIndex(null);
    setErrorMessage('');
  };

  const saveConexion = () => {
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Para adicionar um aparelho, você precisa dar um nome e escolher um ícone para ele, tá? 😉');
      return;
    }
    // Verifica se já existe um aparelho com o mesmo nome, excluindo o que está sendo editado
    if (conexions.some((c, i) => c.text.toLowerCase() === newConexion.text.toLowerCase() && (editingIndex === null || c.id !== newConexion.id))) {
      setErrorMessage(`Hummm, parece que já temos um aparelho chamado "${newConexion.text}" por aqui. Que tal escolher outro nome? 😊`);
      return;
    }

    if (editingIndex !== null) {
      // Atualiza o aparelho existente pelo ID
      setConexions(prev => prev.map(item => item.id === newConexion.id ? newConexion : item));
    } else {
      // Adiciona um novo aparelho
      const newIndex = conexions.length; // Isso é para a animação, o ID é o que importa para o React
      setConexions(prev => [...prev, newConexion]);
      setEnteringIndex(newIndex);
      setTimeout(() => setEnteringIndex(null), 300);
    }
    setShowAddForm(false);
  };

  const removeConexion = (idToRemove) => { // Agora remove pelo ID
    setRemovingIndex(conexions.findIndex(c => c.id === idToRemove)); // Encontra o index para a animação
    setTimeout(() => {
      setConexions(prev => prev.filter(c => c.id !== idToRemove)); // Filtra pelo ID
      setRemovingIndex(null);
    }, 300);
  };

  const handleEditClick = (idToEdit) => { // Agora edita pelo ID
    const c = conexions.find(c => c.id === idToEdit); // Encontra o aparelho pelo ID
    if (c) {
      setNewConexion({ ...c }); // Preenche o formulário com os dados do aparelho
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setShowAddForm(true);
      setEditingIndex(conexions.findIndex(item => item.id === idToEdit)); // Define o index para a animação/lógica de edição
      setErrorMessage('');
    }
  };

  const toggleConnection = (idToToggle) => { // Agora alterna a conexão pelo ID
    setConexions(prev => prev.map(c => c.id === idToToggle ? { ...c, connected: !c.connected } : c));
  };

  return (
    <div className="conexao-container">
      <h1>Aparelhos conectados</h1>
      <button className="add-button-styled" onClick={handleAddClick}><span className="plus-icon">+</span> Adicionar Aparelho</button>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingIndex !== null ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <input type="text" name="text" placeholder="Nome do Aparelho" value={newConexion.text} onChange={(e) => setNewConexion({...newConexion, text: e.target.value})} />
            <div className="icon-picker-styled">
              <label>Escolha o ícone:</label>
              <div className="icons">
                {availableIcons.map((icon) => (
                  <button key={icon.name} className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`} onClick={() => { setNewConexion({...newConexion, icon: icon.src}); setActiveIcon(icon.src); }} title={icon.name}>
                    <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="color-picker-styled">
              <label>Escolha a cor de fundo:</label>
              <div className="colors">
                {availableColors.map((color) => (
                  <button key={color} className={`color-option ${activeColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => { setNewConexion({...newConexion, backgroundColor: color}); setActiveColor(color); }} title={color}></button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button onClick={saveConexion} className="save-button-styled">{editingIndex !== null ? 'Salvar Edição' : 'Salvar'}</button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((c) => ( // Removido 'index' daqui, pois não é mais usado como key
          <div key={c.id} className={`retanguloAdicionado ${removingIndex === conexions.findIndex(item => item.id === c.id) ? 'exiting' : ''} ${enteringIndex === conexions.findIndex(item => item.id === c.id) ? 'entering' : (enteringIndex !== null && conexions.findIndex(item => item.id === c.id) < enteringIndex ? 'entered' : '')} relative`} style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}>
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
            </div>
            <div className="actions-overlay">
              <button className="remove-button" onClick={() => removeConexion(c.id)} title="Remover" disabled={!c.connected} style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}>X</button>
              <button className="edit-button" onClick={() => handleEditClick(c.id)} title="Editar" disabled={!c.connected} style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}>
                <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
              </button>
              <div className="switch-container">
                <label className="switch">
                  <input type="checkbox" checked={c.connected} onChange={() => toggleConnection(c.id)} />
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
