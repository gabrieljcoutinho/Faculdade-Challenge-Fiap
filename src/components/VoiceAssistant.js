import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import icons for voice commands
import tvIcon from '../imgs/TV.png'; // Adjust path as needed
import airConditionerIcon from '../imgs/ar-condicionado.png'; // Adjust path as needed
import lampIcon from '../imgs/lampada.png'; // Adjust path as needed
import airfry from '../imgs/airfry.png'; // Adjust path as needed
import carregador from '../imgs/carregador.png'; // Adjust path as needed


const VoiceAssistant = ({ onAddConexion }) => { // Receive onAddConexion prop
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  // Define available icons mapping for voice commands
  const voiceCommandIcons = {
    'tv': tvIcon,
    'televisão': tvIcon,
    'televisao': tvIcon,
    'ar condicionado': airConditionerIcon,
    'lâmpada': lampIcon,
    'lampada': lampIcon,
    'luz': lampIcon,
    'airfryer': airfry,
    'fritadeira': airfry,
    'carregador': carregador,
    'celular': carregador,
  };

  // Function to recognize commands
  function handleCommand(text) {
    const t = text.toLowerCase();

    // Navigation Commands
    if (
      t.includes('home') ||
      t.includes('página inicial') ||
      t.includes('início') ||
      t.includes('principal') ||
      t.includes('voltar para home') ||
      t.includes('ir para home') ||
      t.includes('vá para home') ||
      t.includes('voltar início') ||
      t.includes('pagina da home') ||
      t.includes('pagina home')
    ) {
      navigate('/');
      setMessage('Indo para Home');
    } else if (
      t.includes('conexão') ||
      t.includes('conexoes') ||
      t.includes('conexões') ||
      t.includes('conectar') ||
      t.includes('minhas conexões') ||
      t.includes('abrir conexões') ||
      t.includes('página de conexões') ||
      t.includes('ir para conexões') ||
      t.includes('aparelho conectado') ||
      t.includes('aparelhos conectado') ||
      t.includes('aparelho conectado')
    ) {
      navigate('/conexoes');
      setMessage('Indo para Conexões');
    } else if (
      t.includes('contato') ||
      t.includes('falar com') ||
      t.includes('fale comigo') ||
      t.includes('atendimento') ||
      t.includes('suporte') ||
      t.includes('página de contato') ||
      t.includes('ir para contato') ||
      t.includes('abrir contato') ||
      t.includes('help center')
    ) {
      navigate('/contato');
      setMessage('Indo para Contato');
    } else if (
      t.includes('configurações') ||
      t.includes('configuracao') ||
      t.includes('ajustes') ||
      t.includes('preferências') ||
      t.includes('configurar') ||
      t.includes('ir para configurações') ||
      t.includes('abrir configurações') ||
      t.includes('ir para configuração') ||
      t.includes('abrir configuração')
    ) {
      navigate('/configuracoes');
      setMessage('Indo para Configurações');
    } else if (
      t.includes('login') ||
      t.includes('logar') ||
      t.includes('entrar') ||
      t.includes('acessar conta') ||
      t.includes('fazer login') ||
      t.includes('página de login') ||
      t.includes('ir para login')
    ) {
      navigate('/login');
      setMessage('Indo para Login');
    } else if (
      t.includes('cadastro') ||
      t.includes('cadastrar') ||
      t.includes('registrar') ||
      t.includes('criar conta') ||
      t.includes('abrir cadastro') ||
      t.includes('fazer cadastro') ||
      t.includes('página de cadastro') ||
      t.includes('ir para cadastro')
    ) {
      navigate('/cadastro');
      setMessage('Indo para Cadastro');
    } else if (
      t.includes('chat') ||
      t.includes('conversar') ||
      t.includes('mensagem') ||
      t.includes('bate-papo') ||
      t.includes('abrir chat') ||
      t.includes('ir para chat') ||
      t.includes('ir para o chat') ||
      t.includes('página de chat')
    ) {
      navigate('/chat');
      setMessage('Indo para Chat');
    }
    // Add Device Command
    else if (t.includes('adicionar aparelho') || t.includes('conectar aparelho') || t.includes('adicionar') || t.includes('conectar')) {
        let deviceName = '';
        let deviceIcon = '';

        for (const [keyword, iconSrc] of Object.entries(voiceCommandIcons)) {
            if (t.includes(keyword)) {
                deviceName = keyword.charAt(0).toUpperCase() + keyword.slice(1); // Capitalize first letter
                deviceIcon = iconSrc;
                break;
            }
        }

        if (deviceName && deviceIcon) {
            onAddConexion({ // Call the prop function
                text: deviceName,
                icon: deviceIcon,
                backgroundColor: '#B0E0E6', // Default color, can be customized
                connected: true,
            });
            setMessage(`Adicionando ${deviceName} às suas conexões.`);
            navigate('/conexoes'); // Optionally navigate to connections page
        } else {
            setMessage('Não consegui identificar o aparelho para adicionar. Tente dizer "Adicionar aparelho TV" ou "Conectar lâmpada".');
        }
    }
    else {
      setMessage('Comando não reconhecido. Tente novamente.');
    }
  }

  // Função para iniciar escuta, criando nova instância toda vez
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage('Estou ouvindo...');
    };

    recognition.onend = () => {
      setListening(false);
      setMessage('Clique e fale');
    };

    recognition.onerror = (event) => {
      setMessage('Erro no reconhecimento: ' + event.error);
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setMessage(`Você disse: "${transcript}"`);
      handleCommand(transcript);
    };

    recognition.start();
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#007bff',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
        cursor: 'pointer',
        userSelect: 'none',
        width: 140,
        textAlign: 'center',
        zIndex: 1000000000,
      }}
      onClick={startListening}
    >
      {listening ? 'Ouvindo...' : 'Clique e fale'}
      <div style={{ fontSize: 12, marginTop: 5 }}>{message}</div>
    </div>
  );
};

export default VoiceAssistant;