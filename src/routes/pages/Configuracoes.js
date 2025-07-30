import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../CSS/Settings/overlay.css';
import '../../CSS/Settings/buttons.css';
import '../../CSS/Settings/layout.css';
import '../../CSS/Settings/images.css';
import '../../CSS/Settings/confirmarDeslogar.css';

import '../../CSS/mudarTema.css';

import { logar, deslogar } from '../../constants/Configuracao/index.js';

import comandosImg from '../../imgs/imgConfiguracao/comandos.png';
import atendimentoImg from '../../imgs/imgConfiguracao/atendimento.png';

const Configuracoes = ({ isReading, toggleReading }) => {
  const navigate = useNavigate();

  // Estado do tema
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light-theme');

  // Estado para mostrar/ocultar confirmação de logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Estado para o ícone do topo esquerdo
  const [iconTopo, setIconTopo] = useState(null);

  useEffect(() => {
    // Aplica o tema no body e salva no localStorage
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para definir o ícone conforme horário
  const atualizarIconeTopo = () => {
    const now = new Date();
    const hora = now.getHours();

    if (hora >= 6 && hora < 17) {
      setIconTopo('sol');
    } else if (hora === 17) {
      setIconTopo('por-do-sol');
    } else {
      setIconTopo('lua');
    }
  };

  useEffect(() => {
    atualizarIconeTopo();

    // Atualiza o ícone a cada 1 minuto para manter sincronizado com o horário
    const interval = setInterval(atualizarIconeTopo, 60000);
    return () => clearInterval(interval);
  }, []);

  // Função para renderizar o ícone do topo esquerdo
  const renderIconTopo = () => {
    switch (iconTopo) {
      case 'sol':
        return <span role="img" aria-label="Dia">☀️</span>;
      case 'por-do-sol':
        return <span role="img" aria-label="Pôr do sol">🌇</span>;
      case 'lua':
        return <span role="img" aria-label="Noite">🌙</span>;
      default:
        return null;
    }
  };

  const toggleTheme = () => setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));

  // Função para confirmar logout e redirecionar
  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    // Aqui você pode limpar tokens, sessão, etc.
    navigate('/login');
  };

  return (
    <div className="configuracoes-overlay" style={{ position: 'relative' }}>
      {/* Ícone no topo esquerdo */}
      <div
        className="icone-topo-esquerdo"

        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontSize: '28px',
          userSelect: 'none',
          cursor: 'default',
        }}
      >
        {renderIconTopo()}
      </div>

      <button className="fechar-btn" onClick={() => navigate(-1)} title="Fechar configurações">
        ✕
      </button>

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
            <button title="Logar" onClick={() => navigate('/login')}>
              {logar}
            </button>

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
              <button onClick={handleLogoutConfirm} className="btn-sim">
                Sim
              </button>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-nao">
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
