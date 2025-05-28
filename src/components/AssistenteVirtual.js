// src/components/AssistenteVirtual.js
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';

const AssistenteVirtual = () => {
  const [ativo, setAtivo] = useState(false);
  const navigate = useNavigate();

  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert('Seu navegador não suporta reconhecimento de voz!');
      return;
    }

    // Começa a escuta contínua em português
    SpeechRecognition.startListening({ continuous: true, language: 'pt-BR' });
  }, []);

  useEffect(() => {
    console.log('Transcript atual:', transcript);

    const comando = transcript.toLowerCase();
    const palavrasChave = ['cleiton', 'cleitom', 'clayton']; // Pequenas variações

    if (palavrasChave.some(p => comando.includes(p))) {
      setAtivo(true);
      console.log('CLEITON ATIVADO!');
      resetTranscript();
      return;
    }

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
