import React, { useEffect, useState } from 'react';
import '../CSS/MudraTemaBTN/style.css'

const MudarTema = () => {
  // Obtém o tema salvo no localStorage ou define 'light' como padrão
  const temaSalvo = localStorage.getItem('tema') === 'dark';
  const [temaEscuro, setTemaEscuro] = useState(temaSalvo);

  useEffect(() => {
    // Aplica ou remove a classe 'dark' no <body> do documento
    // Isso garante que o tema correto seja aplicado no carregamento da página e em cada mudança
    if (temaEscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaEscuro]); // O efeito é re-executado sempre que 'temaEscuro' muda

  // Função para alternar o tema entre claro e escuro
  const alternarTema = () => {
    const novoTema = !temaEscuro; // Inverte o estado atual do tema
    setTemaEscuro(novoTema); // Atualiza o estado do tema
    // Salva a nova preferência de tema no localStorage
    localStorage.setItem('tema', novoTema ? 'dark' : 'light');
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
