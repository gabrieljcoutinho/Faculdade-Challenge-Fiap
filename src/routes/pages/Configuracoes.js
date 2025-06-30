import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../CSS/Settings/overlay.css';
import '../../CSS/Settings/buttons.css';
import '../../CSS/Settings/layout.css';
import '../../CSS/Settings/images.css';


import '../../CSS/mudarTema.css';

import comandosImg from '../../imgs/comandos.png';
import atendimentoImg from '../../imgs/atendimento.png';

const Configuracoes = ({ isReading, toggleReading }) => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light-theme';
  });

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));
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
      <button className="fechar-btn" onClick={fecharConfiguracoes} title="Fechar menu">✕</button>

      <div className="conteudo-configuracoes">
        <div className="btn-container">

          {/* Comandos do Chat */}
          <button className="comando-btn" title="Comandos" onClick={comandosChat}>
            <img src={comandosImg} alt="Comandos" className="imgComando" />
          </button>

          {/* Central de Ajuda */}
          <button className="comando-btn" title="Central de Ajuda" onClick={helpCenter}>
            <img src={atendimentoImg} alt="Atendimento" className="imgComando" />
          </button>

          {/* Ativar/Desativar Leitura em voz alta */}
          <button
            className="comando-btn btnMudarTema"
            onClick={toggleReading}
            title="Ativar/Desativar Leitura em voz alta"
            style={{ fontSize: '16px', padding: '10px', marginTop: '10px' }}
          >
            {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
          </button>

          {/* Mudar Tema */}
          <button
            className="comando-btn btnMudarTema"
            onClick={toggleTheme}
            title="Mudar tema"
            style={{ fontSize: '16px', padding: '10px', marginTop: '10px' }}
          >
            {theme === 'light-theme' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>

          {/* Botões Login/Logout */}
   {/* Botões Login/Logout */}
<div className="top-buttons">
  <button title="Logar" onClick={navegarParaLogin}>Logar</button>
  <button title="Deslogar">Deslogar</button>
</div>


        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
