import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Settings/setting.css';
import comandosImg from '../../imgs/comandos.png';  // importe a imagem

const Configuracoes = () => {
  const navigate = useNavigate();

  const fecharConfiguracoes = () => {
    navigate('/');
  };

  const navegarParaLogin = () => {
    navigate('/login');
  };

  const comandosChat = () => {
    navigate('/comandosChat');
  };

  return (
    <div className="configuracoes-overlay">
      <button className="fechar-btn" onClick={fecharConfiguracoes}>✕</button>
      <div className="conteudo-configuracoes">
        <h1 className='settingTitulo'>Configurações</h1>
        <div className="btn-container">
          <div className="top-buttons">
            <button title="Logar" onClick={navegarParaLogin}>Log In</button>
            <button title="Deslogar">Log out</button>
          </div>
          <button className="comando-btn" title='Comandos' onClick={comandosChat}>
            <img src={comandosImg} alt="Comandos" className='imgComando' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
