import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css'

const MudarTema = () => {
  // Always start with 'light' theme (false for temaEscuro)
  const [temaEscuro, setTemaEscuro] = useState(false);

  useEffect(() => {
    // Apply or remove the 'dark' class on the <body> of the document
    if (temaEscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaEscuro]); // The effect re-runs whenever 'temaEscuro' changes

  // Function to toggle the theme between light and dark
  const alternarTema = () => {
    setTemaEscuro(prevTemaEscuro => !prevTemaEscuro); // Inverts the current theme state
    // localStorage logic is removed, so the theme won't be saved
  };

  return (
    <div className='btnMudarTema'>
      <div className="toggle-container" onClick={alternarTema}>
        <div className={`toggle-botao ${temaEscuro ? 'ativo' : ''}`} >
          <span className="icone">{temaEscuro ? '🌙' : '☀️'}</span>
        </div>
      </div>
    </div>
  );
};

export default MudarTema;