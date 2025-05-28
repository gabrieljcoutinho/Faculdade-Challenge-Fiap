// src/components/AssistenteVirtual.js
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';

const AssistenteVirtual = () => {
  const [ativo, setAtivo] = useState(false);
  const navigate = useNavigate();

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  useEffect(() => {
    // Sempre que o transcript for atualizado
    if (!transcript) return;

    const comando = transcript.toLowerCase();
    console.log('Comando recebido:', comando);

    // Ativar assistente ao ouvir "umbra"
    if (comando.includes('umbra')) {
      setAtivo(true);
      resetTranscript();
      console.log('Assistente ativado!');
      return;
    }

    // Se estiver ativo, processar comandos de páginas
    if (ativo) {
      if (comando.includes('contato')) {
        navigate('/contato');
        resetTranscript();
      } else if (comando.includes('conexões')) {
        navigate('/conexoes');
        resetTranscript();
      } else if (comando.includes('configurações')) {
        navigate('/configuracoes');
        resetTranscript();
      } else if (comando.includes('cadastro')) {
        navigate('/cadastro');
        resetTranscript();
      } else if (comando.includes('home')) {
        navigate('/');
        resetTranscript();
      } else if (comando.includes('chat')) {
        navigate('/chat');
        resetTranscript();
      }
    }
  }, [transcript, ativo, navigate, resetTranscript]);

  useEffect(() => {
    // Começar a escuta contínua ao carregar o componente
    SpeechRecognition.startListening({ continuous: true, language: 'pt-BR' });
  }, []);

  return (
    <div>
      {ativo && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            border: '10px solid rgba(15, 240, 252)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
};

export default AssistenteVirtual;
