// src/components/MudarTema.jsx
import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css';

const MudarTema = () => {
  const [temaEscuro, setTemaEscuro] = useState(false); // sempre começa no claro
  const [icone, setIcone] = useState('☀️'); // sempre começa com o sol

  useEffect(() => {
    // Sempre começa com tema claro
    document.body.classList.remove('dark');
    localStorage.setItem('tema', 'light');
  }, []);

  const alternarTema = () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    localStorage.setItem('tema', novoTema ? 'dark' : 'light');

    if (novoTema) {
      document.body.classList.add('dark');
      setIcone('🌙');
    } else {
      document.body.classList.remove('dark');
      setIcone('☀️');
    }
  };

  return (
    <div className='btnMudarTema'>
      <div className="toggle-container" onClick={alternarTema}>
        <div className={`toggle-botao ${temaEscuro ? 'ativo' : ''}`}>
          <span className="icone">{icone}</span>
        </div>
      </div>
    </div>
  );
};

export default MudarTema;
