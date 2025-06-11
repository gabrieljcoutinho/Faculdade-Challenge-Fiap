import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css';

const MudarTema = () => {
  const [temaEscuro, setTemaEscuro] = useState(false);

  // Ao montar, força ler do localStorage
  useEffect(() => {
    const temaSalvo = localStorage.getItem('tema');
    setTemaEscuro(temaSalvo === 'dark');
    // Aplica ou remove a classe no body de acordo
    if (temaSalvo === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  // Quando o estado mudar, atualiza localStorage e classe do body
  useEffect(() => {
    localStorage.setItem('tema', temaEscuro ? 'dark' : 'light');
    if (temaEscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaEscuro]);

  const alternarTema = () => {
    setTemaEscuro(prev => !prev);
  };

  return (
    <div className='btnMudarTema'>
      <div className="toggle-container" onClick={alternarTema}>
        <div className={`toggle-botao ${temaEscuro ? 'ativo' : ''}`}>
          <span className="icone">{temaEscuro ? '🌙' : '☀️'}</span>
        </div>
      </div>
    </div>
  );
};

export default MudarTema;
