// src/components/MudarTema.jsx
import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css'

const MudarTema = () => {
  const temaSalvo = localStorage.getItem('tema') === 'dark';
  const [temaEscuro, setTemaEscuro] = useState(temaSalvo);

  useEffect(() => {
    // Garante que o tema correto seja aplicado no carregamento
    if (temaEscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaEscuro]);

  const alternarTema = () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    localStorage.setItem('tema', novoTema ? 'dark' : 'light');
  };

  return (
    <div className='btnMudarTema'>
 <div className="toggle-container" onClick={alternarTema}>
  <div className=  {`toggle-botao ${temaEscuro ? 'ativo' : ''}`} >
    <span className="icone">{temaEscuro ? '🌙' : '☀️'}</span>
  </div>
</div>

    </div>


  );
};

export default MudarTema;
