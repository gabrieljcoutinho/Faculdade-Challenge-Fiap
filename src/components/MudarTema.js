// src/components/MudarTema.jsx
import React, { useEffect, useState } from 'react';

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
    <button className="botao-tema" onClick={alternarTema}>
      {temaEscuro ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
    </button>
  );
};

export default MudarTema;
