// src/routes/pages/Configuracoes.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';


import '../../CSS/Settings/setting.css';
import '../../CSS/Settings/btnSwitch.css';


import comandosImg from '../../imgs/comandos.png';
import atendimentoImg from '../../imgs/atendimento.png';
import { ThemeContext } from '../../components/ThemeProvider';

const Configuracoes = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

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
      <button className="fechar-btn" onClick={fecharConfiguracoes}>
        ✕
      </button>
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

          <div className="top-buttons">
            <button title="Logar" onClick={navegarParaLogin}>
              Log In
            </button>
            <button title="Deslogar">Log out</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
            {/* O texto opcional aqui se quiser algo tipo "Dark Mode" ao lado */}
            <span style={{ marginLeft: '10px', verticalAlign: 'middle', userSelect: 'none' }}>
              {theme === 'light' }
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Configuracoes;