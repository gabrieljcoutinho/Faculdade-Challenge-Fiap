import React, { useState, useEffect } from 'react';
import './CSS/Reset.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
import ComandosChat from './routes/pages/ComandosChat';
import EsqueciSenha from './routes/pages/EsqueciSenha';
import HelpCenter from './routes/HelpCenter';

// Importe os ícones que podem ser usados como padrão para novos aparelhos
// Certifique-se de que esses caminhos estão corretos
import tvIcon from './imgs/TV.png';
import airConditionerIcon from './imgs/ar-condicionado.png';
import airfry from './imgs/airfry.png';
import lampIcon from './imgs/lampada.png';
import carregador from './imgs/carregador.png';

function App() {
    // Estado para armazenar a lista de conexões/aparelhos
    // Inicializa a partir do localStorage ou com um array vazio
    const [conexions, setConexions] = useState(() => {
        const savedConexions = localStorage.getItem('conexions');
        return savedConexions ? JSON.parse(savedConexions) : [];
    });

    // --- NOVO ESTADO: Dados de Produção de Energia Solar ---
    const [productionData, setProductionData] = useState({
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        datasets: [{ label: 'Produção (kWh)', data: [5, 12, 25, 30, 22, 15, 8], borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.6)', tension: 0.4 }]
    });

    // Salva o estado 'conexions' no localStorage sempre que ele é atualizado
    useEffect(() => {
        localStorage.setItem('conexions', JSON.stringify(conexions));
    }, [conexions]);

    const handleUpdateProductionData = (newData) => {
        setProductionData(newData);
    };
    const handleConnectDevice = (deviceType, customName) => {
        setConexions(prevConexions => {
            const finalDeviceName = customName || deviceType;
            const normalizedFinalDeviceName = finalDeviceName.toLowerCase();

            // Verifica se o aparelho já existe na lista com o nome final
            // Agora, a busca por um aparelho existente é mais robusta
            const existingDeviceIndex = prevConexions.findIndex(
                (c) => c.text.toLowerCase() === normalizedFinalDeviceName
            );

            // Determina o ícone e a cor padrão com base no tipo do aparelho
            let defaultIcon;
            let defaultColor;

            switch (deviceType) {
                case 'TV':
                    defaultIcon = tvIcon;
                    defaultColor = '#B0E0E6';
                    break;
                case 'Ar-Condicionado':
                    defaultIcon = airConditionerIcon;
                    defaultColor = '#E0FFFF';
                    break;
                case 'Lâmpada':
                    defaultIcon = lampIcon;
                    defaultColor = '#FFEBCD';
                    break;
                case 'Airfry':
                    defaultIcon = airfry;
                    defaultColor = '#FFDAB9';
                    break;
                case 'Carregador':
                    defaultIcon = carregador;
                    defaultColor = '#FFE4E1';
                    break;
                default:
                    // Fallback para tipos desconhecidos, embora com esta lógica,
                    // deve sempre haver uma correspondência.
                    defaultIcon = ''; // Considere um ícone genérico ou um placeholder
                    defaultColor = '#CCCCCC';
                    break;
            }


            if (existingDeviceIndex !== -1) {
                // Se o aparelho já existe, atualiza o status para 'connected: true'
                // Também atualiza o ícone e a cor, caso tenha sido adicionado com um genérico antes
                return prevConexions.map((c, index) =>
                    index === existingDeviceIndex ? { ...c, connected: true, icon: defaultIcon, backgroundColor: defaultColor } : c
                );
            } else {
                // Se o aparelho não existe, adiciona um novo com o nome personalizado e um ID único
                const newDevice = {
                    id: crypto.randomUUID(), // Adiciona um ID único para o aparelho
                    text: finalDeviceName, // Usa o nome personalizado aqui
                    icon: defaultIcon,
                    backgroundColor: defaultColor,
                    connected: true,
                };

                return [...prevConexions, newDevice];
            }
        });
    };

    return (
        <div className="App">
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route
                        path="/"
                        element={<Home productionData={productionData} onUpdateProductionData={handleUpdateProductionData} />}
                    />

                    <Route path="/conexoes" element={<Conexoes conexions={conexions} setConexions={setConexions} />} />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/login" element={<Logar />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route
                        path="/chat"
                        element={<Chat onConnectDevice={handleConnectDevice} productionData={productionData} />}
                    />
                    <Route path='/comandosChat' element={<ComandosChat />} />
               <Route path="/esqueciSenha" element={<EsqueciSenha />} />
               <Route path="/helpCenter" element={<HelpCenter />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </div>
    );
}

export default App;