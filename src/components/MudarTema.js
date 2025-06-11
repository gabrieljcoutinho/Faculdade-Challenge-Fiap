import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css'

const MudarTema = () => {
  // Initialize temaEscuro state directly from localStorage
  const [temaEscuro, setTemaEscuro] = useState(
    localStorage.getItem('tema') === 'dark'
  );

  useEffect(() => {
    // Apply or remove the 'dark' class on the <body> element
    if (temaEscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    // Save the current theme preference to localStorage whenever temaEscuro changes
    localStorage.setItem('tema', temaEscuro ? 'dark' : 'light');
  }, [temaEscuro]); // This effect runs whenever 'temaEscuro' changes

  // Function to toggle the theme between light and dark
  const alternarTema = () => {
    setTemaEscuro(prevTema => !prevTema); // Toggle the theme state
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