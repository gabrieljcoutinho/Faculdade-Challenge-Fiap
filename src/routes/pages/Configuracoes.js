import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../CSS/Settings/overlay.module.css';
import '../../CSS/Settings/buttons.module.css';
import '../../CSS/Settings/layout.module.css';
import '../../CSS/Settings/images.module.css';
import '../../CSS/Settings/confirmarDeslogar.module.css';

import '../../CSS/mudarTema.css';

import { logar, deslogar } from '../../constants/Configuracao/index.js';

import comandosImg from '../../imgs/imgConfiguracao/comandos.png';
import atendimentoImg from '../../imgs/imgConfiguracao/atendimento.png';
import bateria from '../../imgs/imgBateria/bateria.png';

const Configuracoes = ({ isReading, toggleReading }) => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light-theme');

  // Estado para mostrar/ocultar confirmação de logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));

  // Função para confirmar logout e redirecionar
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    // Aqui você pode limpar tokens, sessão, etc.
    navigate('/login');
  };

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

          <button className='comando-btn' onClick={() => navigate('/bateria')} >
      <img src={bateria} alt="Bateria" className="imgComando"/>
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

            {/* Botão de deslogar abre confirmação */}
            <button title="Deslogar" onClick={() => setShowLogoutConfirm(true)}>
              {deslogar}
            </button>
          </div>

        </div>
      </div>

      {/* Modal de confirmação logout */}
      {showLogoutConfirm && (
        <div className="modal-logout-overlay">
          <div className="modal-logout-content">
            <p>Você quer deslogar?</p>
            <div>
              <button onClick={handleLogoutConfirm} className="btn-sim">Sim</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-nao">Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
