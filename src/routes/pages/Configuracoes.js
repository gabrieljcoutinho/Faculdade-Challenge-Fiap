import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../CSS/Settings/overlay.css';
import '../../CSS/Settings/buttons.css';
import '../../CSS/Settings/layout.css';
import '../../CSS/Settings/images.css';

import '../../CSS/mudarTema.css';

import { logar, deslogar } from '../../constants/Configuracao/index.js';

import comandosImg from '../../imgs/imgConfiguracao/comandos.png';
import atendimentoImg from '../../imgs/imgConfiguracao/atendimento.png';

const Configuracoes = ({ isReading, toggleReading }) => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light-theme');

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));

  return (
    <div className="configuracoes-overlay">
      <button className="fechar-btn" onClick={() => navigate(-1)} title="Fechar configurações">✕</button>

      <div className="conteudo-configuracoes">
        <div className="btn-container">

          <button className="comando-btn" title="Comandos" onClick={() => navigate('/comandosChat')}>
            <img src={comandosImg} alt="Comandos" className="imgComando" />
          </button>

          <button className="comando-btn" title="Central de Ajuda" onClick={() => navigate('/helpCenter')}>
            <img src={atendimentoImg} alt="Atendimento" className="imgComando" />
          </button>

          <button
            className="comando-btn btnMudarTema"
            onClick={toggleReading}
            title="Ativando leitor de tela"
            style={{ fontSize: '16px', padding: '10px', marginTop: '10px' }}
          >
            {isReading ? '🔈 Leitura Ativa' : '🔇 Leitura Desativada'}
          </button>

          <button
            className="comando-btn btnMudarTema"
            onClick={toggleTheme}
            title="Mudar tema"
            style={{ fontSize: '16px', padding: '10px', marginTop: '10px' }}
          >
            {theme === 'light-theme' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>

          <div className="top-buttons" style={{ marginTop: '10px' }}>
            <button title="Logar" onClick={() => navigate('/login')}>{logar}</button>
            <button title="Deslogar" onClick={() => navigate('/login')}>{deslogar}</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
