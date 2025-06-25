import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Settings/setting.css';
import comandosImg from '../../imgs/comandos.png';
import atendimentoImg from '../../imgs/atendimento.png';
import micOn from '../../imgs/micOn.png';
import micOff from '../../imgs/micOff.png';

const Configuracoes = () => {
  const navigate = useNavigate();
  const [micAtivo, setMicAtivo] = useState(false);

  // Usar useRef para guardar a instância do reconhecimento para manter entre renders
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Criar o objeto SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'pt-BR'; // define idioma PT-BR
    recognitionRef.current.interimResults = false; // só resultados finais
    recognitionRef.current.continuous = false; // para não ficar escutando pra sempre



recognitionRef.current.onresult = event => {
  const speechToText = event.results[0][0].transcript.toLowerCase().trim();
  console.log('Você falou:', speechToText);

  if (speechToText.includes('home')) {
    navigate('/');
  } else if (speechToText.includes('início')) {
    navigate('/');
  } else if (speechToText.includes('pagina inicial')) {
    navigate('/');
  }else if (speechToText.includes('conexão') || speechToText.includes('conexao')) {
    navigate('/conexoes');
  } else if (speechToText.includes('chat')) {
    navigate('/chat');
  } else if (speechToText.includes('Contato')) {
    navigate('/contato');
  } else if (speechToText.includes('contato')) {
    navigate('/contato');
  }else if (speechToText.includes('configuração') || speechToText.includes('configuracao')) {
    navigate('/configuracoes');
  } else if (speechToText.includes('comandos')) {
    navigate('/comandosChat');
  } else if (speechToText.includes('help center')) {
    navigate('/helpCenter');
  } else {
    alert(`Comando não reconhecido: "${speechToText}"`);
  }
};




    // Tratar erro (ex: usuário não permitiu mic)
    recognitionRef.current.onerror = event => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setMicAtivo(false);
    };

    // Quando o reconhecimento terminar, desativar o mic para permitir reativação depois
    recognitionRef.current.onend = () => {
      setMicAtivo(false);
    };

  }, [navigate]);

  const alternarMic = () => {
    if (!recognitionRef.current) return;

    if (micAtivo) {
      // Se mic estiver ativo, parar reconhecimento
      recognitionRef.current.stop();
      setMicAtivo(false);
    } else {
      // Se mic estiver desligado, iniciar reconhecimento
      try {
        recognitionRef.current.start();
        setMicAtivo(true);
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento:', error);
      }
    }
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
          <button className="comando-btn" title="Ajuda" onClick={helpCenter}>
            <img src={atendimentoImg} alt="Ajuda" className="imgComando" />
          </button>

          {/* Botão para Ativar Microfone */}
          <button
            className={`comando-btn ${micAtivo ? 'ativo' : ''}`}
            onClick={alternarMic}
            title="Ativar/Desativar Microfone"
          >
            <img src={micAtivo ? micOn : micOff} alt="Microfone" className="imgComando" />
          </button>

          {/* Botões de Login/Logout */}
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
