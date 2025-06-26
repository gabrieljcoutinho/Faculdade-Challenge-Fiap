import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Settings/setting.css';
import '../../CSS/mudarTema.css'; // importe o CSS do tema aqui
import comandosImg from '../../imgs/comandos.png';
import atendimentoImg from '../../imgs/atendimento.png';

const Configuracoes = () => {
  const navigate = useNavigate();

  // Estado do tema
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light-theme';
  });

  // Aplica a classe no body sempre que o tema mudar
  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light-theme' ? 'dark-theme' : 'light-theme');
  };

  const fecharConfiguracoes = () => {
    navigate('/');
  };

  const navegarParaLogin = () => {
    navigate('/login');
  };

  const comandosChat = () => {
    navigate('/comandosChat');
  };

  const helpCenter = () => {
    navigate('/helpCenter');
  };

  return (
    <div className="configuracoes-overlay">
      <button className="fechar-btn" onClick={fecharConfiguracoes}>✕</button>
      <div className="conteudo-configuracoes">
        <div className="btn-container">

          {/* Botão para Comandos do Chat */}
          <button className="comando-btn" title="Comandos" onClick={comandosChat}>
            <img src={comandosImg} alt="Comandos" className="imgComando" />
          </button>

          {/* Botão para Central de Ajuda */}
          <button className="comando-btn" title="Central de Ajuda" onClick={helpCenter}>
            <img src={atendimentoImg} alt="Atendimento" className="imgComando" />
          </button>

          {/* Botão para trocar tema */}
          <button
            className="comando-btn"
            onClick={toggleTheme}
            title="Mudar tema"
            style={{ fontSize: '16px', padding: '10px', marginTop: '10px' }}
          >
            {theme === 'light-theme' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>



          <div className="top-buttons">
            <button title="Logar" onClick={navegarParaLogin}>Log In</button>
            <button title="Deslogar">Log out</button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
