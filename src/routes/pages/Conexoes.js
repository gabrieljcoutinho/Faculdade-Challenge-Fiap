import React, { useState, useEffect } from 'react';
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';

const Conexoes = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  const handleAddClick = () => {
    setShowColorPicker(true);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setConexions([...conexions, { backgroundColor: color }]);
    setShowColorPicker(false);
  };

  const removeConexion = (indexToRemove) => {
    setConexions(conexions.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="conexao-container">
      <h1>Aparelhos conectados</h1>
      <div className="retanguloAdiciona" onClick={handleAddClick}>
        +
      </div>

      {showColorPicker && (
        <div className="color-picker">
          <button
            style={{ backgroundColor: '#000' }}
            onClick={() => handleColorSelect('#000')}
          >
           Nível 1
          </button>

            <button
            style={{ backgroundColor: '#555' }}
            onClick={() => handleColorSelect('#555')}
          >
            Nível 2
          </button>

            <button
            style={{ backgroundColor: '#d3d3d3' }}
            onClick={() => handleColorSelect('#d3d3d3')}
          >
            Nível 3
          </button>
        </div>
      )}

      <div className="conexions-list">
        {conexions.map((conexion, index) => (
          <div
            key={index}
            className="retanguloAdicionado"
            style={{ backgroundColor: conexion.backgroundColor }}
          >
            <button
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'red',
                border: 'none',
                color: 'white',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '5px',
              }}
              onClick={() => removeConexion(index)}
            >
              X
            </button>
          </div>
        ))}
        <div style={{ height: '60px' }}></div> {/* Adicionando um espaço no final */}
      </div>
    </div>
  );
};

export default Conexoes;