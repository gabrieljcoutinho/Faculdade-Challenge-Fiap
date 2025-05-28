import './CSS/Reset.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react'; // Import useEffect and useCallback

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar';
import Cadastro from './routes/pages/Cadastro';
import Chat from './routes/pages/Chat';

// Custom Hook for Speech Recognition
import useSpeechRecognition from '../src/components/useSpeechRecognition';

function App() {
  const navigate = useNavigate(); // This hook must be called inside a component rendered within BrowserRouter

  // Define your routes and their keywords
  const routesMap = {
    'home': '/',
    'conexões': '/conexoes',
    'contato': '/contato',
    'configurações': '/configuracoes',
    'login': '/login',
    'logar': '/login', // Alias for login
    'cadastro': '/cadastro',
    'chat': '/chat',
  };

  const handleSpeechCommand = useCallback((command) => {
    // Check if any route keyword is in the command
    for (const keyword in routesMap) {
      if (command.includes(keyword)) {
        console.log(`Navigating to: ${routesMap[keyword]}`);
        navigate(routesMap[keyword]);
        return; // Navigate and stop checking
      }
    }
  }, [navigate, routesMap]); // Ensure dependencies are correct

  // Initialize speech recognition
  const { isListening } = useSpeechRecognition(handleSpeechCommand);

  return (
    <div className="App">
      {/* You can add a visual indicator here if you want */}
      {isListening && <div style={{ position: 'fixed', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 1000 }}>
        Microphone Active
      </div>}
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conexoes" element={<Conexoes />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/login" element={<Logar />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
      <Footer />
    </div>
  );
}

// Wrapper component to use useNavigate in App
const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;