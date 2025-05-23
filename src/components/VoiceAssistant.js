import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  // Use useRef to persist the recognition object across renders without causing re-renders
  const recognitionRef = useRef(null);

  // Function to initialize or re-initialize the SpeechRecognition object
  const initializeRecognition = () => {
    // Check for browser support for SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Seu navegador não suporta reconhecimento de voz.');
      return null; // Return null if not supported
    }

    // Create a new SpeechRecognition instance
    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = false; // Set to false for single-phrase recognition
    newRecognition.lang = 'pt-BR'; // Set language to Brazilian Portuguese
    newRecognition.interimResults = false; // Only return final results

    // Event handler for when recognition starts
    newRecognition.onstart = () => {
      setListening(true); // Update listening state
      setMessage('Estou ouvindo...'); // Provide user feedback
    };

    // Event handler for when recognition ends (either naturally or due to stop/error)
    newRecognition.onend = () => {
      setListening(false); // Update listening state
      setMessage('Diga algo para navegar...'); // Prompt user for next command
      // No automatic restart here, as the user clicks to speak again
    };

    // Event handler for recognition errors
    newRecognition.onerror = (event) => {
      setMessage('Erro no reconhecimento: ' + event.error); // Display error message
      setListening(false); // Reset listening state
      console.error('Speech Recognition Error:', event.error); // Log error for debugging
    };

    // Event handler for when a recognition result is available
    newRecognition.onresult = (event) => {
      // Get the transcript from the first result
      const transcript = event.results[0][0].transcript.toLowerCase();
      setMessage(`Você disse: "${transcript}"`); // Display what was heard
      handleCommand(transcript); // Process the voice command
    };

    return newRecognition; // Return the configured recognition instance
  };

  // useEffect hook to initialize recognition once when the component mounts
  useEffect(() => {
    recognitionRef.current = initializeRecognition(); // Store the recognition instance in the ref

    // Cleanup function: stop recognition if active when the component unmounts
    return () => {
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle voice commands and navigate
  const handleCommand = (text) => {
    // Check for common commands and navigate accordingly
    if (text.includes('home')) {
      navigate('/');
      setMessage('Indo para Home');
    } else if (text.includes('conexão') || text.includes('conexoes') || text.includes('conexões')) {
      navigate('/conexoes');
      setMessage('Indo para Conexões');
    } else if (text.includes('contato')) {
      navigate('/contato');
      setMessage('Indo para Contato');
    } else if (text.includes('configurações') || text.includes('configuracao')) {
      navigate('/configuracoes');
      setMessage('Indo para Configurações');
    } else if (text.includes('login') || text.includes('logar')) {
      navigate('/login');
      setMessage('Indo para Login');
    } else if (text.includes('cadastro')) {
      navigate('/cadastro');
      setMessage('Indo para Cadastro');
    } else if (text.includes('chat')) {
      navigate('/chat');
      setMessage('Indo para Chat');
    } else {
      setMessage('Comando não reconhecido. Tente novamente.'); // Fallback for unrecognized commands
    }
  };

  // Function to start the listening process
  const startListening = () => {
    // Ensure recognition object exists and is supported
    if (!recognitionRef.current) {
      setMessage('Reconhecimento de voz não disponível.');
      return;
    }

    // If already listening, stop the current session before starting a new one
    if (listening) {
      recognitionRef.current.stop();
      setListening(false); // Update state to reflect that listening has stopped
    }

    try {
      // Attempt to start the recognition
      recognitionRef.current.start();
    } catch (e) {
      // Catch any errors that occur when trying to start recognition
      setMessage('Não foi possível iniciar o reconhecimento de voz. Tente novamente.');
      console.error('Error starting recognition:', e);
      // In case of an error, try to re-initialize the recognition object to recover
      recognitionRef.current = initializeRecognition();
    }
  };

  return (
    <div style={{position: 'fixed', bottom: 20, right: 20, backgroundColor: '#007bff', color: '#fff', padding: 10, borderRadius: 8, cursor: 'pointer', userSelect: 'none'}}>
      <div onClick={startListening}>
        {listening ? 'Ouvindo...' : 'Clique e fale'}
      </div>
      <div style={{fontSize: 12, marginTop: 5}}>{message}</div>
    </div>
  );
};

export default VoiceAssistant;
