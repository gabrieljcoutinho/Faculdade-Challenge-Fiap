import { useEffect, useState, useRef } from 'react';

const useSpeechRecognition = (onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const umbraActivatedRef = useRef(false); // To track if Umbra is active
  const activationTimeoutRef = useRef(null); // To clear the border after inactivity

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Web Speech API is not supported by this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'pt-BR'; // Set language to Portuguese

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started.');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      console.log('Transcript:', transcript);

      if (!umbraActivatedRef.current && transcript.toLowerCase().includes('umbra')) {
        umbraActivatedRef.current = true;
        document.body.style.border = '10px solid rgba(15, 240, 252)'; // Set a border
        document.body.style.boxSizing = 'border-box'; // Ensure border doesn't push content
        console.log('UMBRA activated!');
        // Set a timeout to clear the border after a period of inactivity
        if (activationTimeoutRef.current) {
          clearTimeout(activationTimeoutRef.current);
        }
        activationTimeoutRef.current = setTimeout(() => {
          document.body.style.border = 'none';
          umbraActivatedRef.current = false;
          console.log('UMBRA deactivated due to inactivity.');
        }, 8000); // Deactivate after 8 seconds of no commands
      } else if (umbraActivatedRef.current) {
        // If Umbra is active, process the command
        onCommand(transcript.toLowerCase());
        // Reset the inactivity timeout on each command
        if (activationTimeoutRef.current) {
          clearTimeout(activationTimeoutRef.current);
        }
        activationTimeoutRef.current = setTimeout(() => {
          document.body.style.border = 'none';
          umbraActivatedRef.current = false;
          console.log('UMBRA deactivated due to inactivity.');
        }, 8000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      umbraActivatedRef.current = false;
      document.body.style.border = 'none';
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended. Restarting...');
      // Automatically restart listening if it stops
      if (umbraActivatedRef.current) { // Only restart if Umbra was active
        recognition.start();
      } else { // Always start initially
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start(); // Start listening when the component mounts

    return () => {
      recognition.stop();
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
      }
    };
  }, [onCommand]); // Re-run if onCommand changes (though typically it won't)

  return { isListening };
};

export default useSpeechRecognition;