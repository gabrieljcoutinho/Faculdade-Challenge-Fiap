import './CSS/Reset.css';

import { BrowserRouter, Routes, Route} from 'react-router-dom'

//Components
import Header from './components/Header';
import Footer from './components/Footer';


//Pages
import Home from './routes/pages/Home';
import Conexoes from './routes/pages/Conexoes';
import Contato from './routes/pages/Contato';
import Configuracoes from './routes/pages/Configuracoes';
import Logar from './routes/pages/Logar'; // Importe o componente Logar
import Cadastro from './routes/pages/Cadastro';

function App() {
  return (
    <div className="App">
      <BrowserRouter>

        <Header />



        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conexoes" element={<Conexoes />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/login" element={<Logar />} /> {/* Adicione a rota para Logar */}
            <Route path="/cadastro" element={<Cadastro />} />
        </Routes>

        <Footer />

      </BrowserRouter>
    </div>
  );
}

export default App;