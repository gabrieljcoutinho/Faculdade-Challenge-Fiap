import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Settings/setting.css';
import comandosImg from '../../imgs/comandos.png';
import atendimentoImg from '../../imgs/atendimento.png';


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

  const helpCenter = () => {
    navigate('/helpCenter');
  };

  return (
    <div className="configuracoes-overlay">
      <button className="fechar-btn" onClick={fecharConfiguracoes}>✕</button>
      <div className="conteudo-configuracoes">
        <div className="btn-container">


          <button className="comando-btn" title='Comandos' onClick={comandosChat}>
            <img src={comandosImg} alt="Comandos" className='imgComando' />
          </button>


          <button className="comando-btn" title='Comandos' onClick={helpCenter}>
            <img src={atendimentoImg} alt="Comandos" className='imgComando' />
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
