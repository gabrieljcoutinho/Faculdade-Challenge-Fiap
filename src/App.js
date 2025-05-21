import './CSS/Reset.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import SplashScreen from '../src/routes/pages/SplashScreen';

// Pages
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar';
import Cadastro from './routes/pages/Cadastro';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // tempo da splash screen em milissegundos
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        {loading ? (
          <SplashScreen />
        ) : (
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/conexoes" element={<Conexoes />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/login" element={<Logar />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Routes>
            <Footer />
          </>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
