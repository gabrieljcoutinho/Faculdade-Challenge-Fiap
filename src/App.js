// App.js (or a suitable parent component)
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Conexoes from './components/Conexao/Conexoes'; // Adjust path
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant'; // Adjust path
import Home from './components/Home'; // Example of other routes
import Contato from './components/Contato'; // Example of other routes
import Configuracoes from './components/Configuracoes'; // Example of other routes
import Login from './components/Login'; // Example of other routes
import Cadastro from './components/Cadastro'; // Example of other routes
import Chat from './components/Chat'; // Example of other routes


const App = () => {
  const [conexions, setConexions] = useState(() => {
    const storedConexions = localStorage.getItem('conexions');
    return storedConexions ? JSON.parse(storedConexions) : [];
  });

  const addConexionFromVoice = (newConexion) => {
    const isDuplicate = conexions.some(
      (conexion) => conexion.text.toLowerCase() === newConexion.text.toLowerCase()
    );

    if (isDuplicate) {
      console.warn(`Connection "${newConexion.text}" already exists.`);
      // You might want to provide feedback to the user via the voice assistant
      return;
    }

    setConexions((prevConexions) => [...prevConexions, newConexion]);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/conexoes"
          element={<Conexoes conexions={conexions} setConexions={setConexions} />}
        />
        <Route path="/contato" element={<Contato />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/chat" element={<Chat />} />
        {/* Add other routes here */}
      </Routes>
      <VoiceAssistant onAddConexion={addConexionFromVoice} />
    </Router>
  );
};

export default App;