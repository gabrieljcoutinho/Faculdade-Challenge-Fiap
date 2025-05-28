// src/App.js
import './CSS/Reset.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import VoiceCommands from './components/VoiceCommands';

// Pages
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar';
import Cadastro from './routes/pages/Cadastro';
import Chat from './routes/pages/Chat';

function App() {
 return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <VoiceCommands /> {/* Ativa o reconhecimento de voz */}
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
      </BrowserRouter>
    </div>
  );
}

export default App;
