import React, { useState, useEffect, useRef } from 'react';

// Importa os arquivos de estilo (CSS) para deixar a página mais bonita
import '../../CSS/Home/home.css'; // Estilos gerais da página inicial
import '../../CSS/Home/expanded.css'; // Estilos para quando o gráfico é ampliado
import '../../CSS/Home/analyze.css'; // Estilos para o botão de analisar
import '../../CSS/Home/share.css'; // Estilos para as opções de compartilhamento
import '../../CSS/Home/chart.css'; // Estilos gerais dos gráficos
import '../../CSS/Home/closeBtn.css'; // Estilos para o botão de fechar
import '../../CSS/Home/forecast.css'; // Estilos para a seção de previsão do tempo
import '../../CSS/Home/weather.css'; // Estilos para a seção de clima atual
import '../../CSS/Home/current.css'; // Mais estilos para o clima atual
import '../../CSS/Home/production.css'; // Estilos para a seção de produção
import '../../CSS/Home/mediaScreen.css'; // Estilos para diferentes tamanhos de tela

// Importa componentes de gráficos da biblioteca react-chartjs-2
import { Line, Pie, Bar } from 'react-chartjs-2';

// Importa as logos para as opções de compartilhamento
import logoGmail from '../../imgs/Logogmail.png';
import logoWhasapp from '../../imgs/Logowhatsapp.png';
import logoInstagram from '../../imgs/Logoinstagram.png';
import logoLinkedin from '../../imgs/Logolinkedin.png';

// Importa funcionalidades específicas da biblioteca chart.js para configurar os gráficos
import {
    Chart as ChartJS, // Classe principal do Chart.js
    LineElement, // Para criar as linhas no gráfico de linha
    PointElement, // Para criar os pontos nos gráficos de linha e outros
    LinearScale, // Para as escalas numéricas (eixo Y)
    Title, // Para o título do gráfico
    CategoryScale, // Para as escalas de categorias (eixo X, como as horas)
    PieController, // Para criar o gráfico de pizza
    ArcElement, // Para os pedaços do gráfico de pizza
    BarController, // Para criar o gráfico de barras
    BarElement, // Para as barras do gráfico de barras
    Legend, // Para a legenda que explica as cores do gráfico
    Tooltip, // Para a caixa de informação que aparece ao passar o mouse
} from 'chart.js';

// Registra as funcionalidades que vamos usar no Chart.js
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    PieController,
    ArcElement,
    BarController,
    BarElement,
    Legend,
    Tooltip
);

// Componente funcional Home
const Home = () => {
    // Estado para controlar se a análise dos dados está em andamento
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Estado para controlar o tipo de gráfico que está sendo exibido ('line', 'bar', 'pie')
    const [chartType, setChartType] = useState('line');
    // Estado para armazenar os dados de produção de energia
    const [productionData, setProductionData] = useState({
        // Rótulos para o eixo X (as horas do dia)
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        // Conjunto de dados para o gráfico
        datasets: [
            {
                label: 'Produção (kWh)', // Título da linha/barras/pedaços
                data: [5, 12, 25, 30, 22, 15, 8], // Valores de produção em cada hora
                borderColor: 'rgba(75, 192, 192, 1)', // Cor da linha ou borda das barras/pedaços
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Cor de fundo das barras/pedaços
                tension: 0.4, // Curvatura da linha (para gráfico de linha)
            },
        ],
    });

    // Referência para o componente de gráfico (usado para salvar a imagem)
    const chartRef = useRef(null);
    // Estado para controlar qual gráfico está ampliado (se algum)
    const [expandedChart, setExpandedChart] = useState(null);
    // Estado para controlar se as opções de compartilhamento estão visíveis
    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);

    // Opções comuns para todos os tipos de gráficos
    const commonChartOptions = {
        responsive: true, // Faz o gráfico se ajustar ao tamanho do container
        maintainAspectRatio: false, // Permite que a proporção do gráfico seja alterada
        plugins: {
            legend: {
                labels: {
                    color: '#fff', // Cor do texto da legenda
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Cor de fundo da caixa de informação
                bodyColor: '#fff', // Cor do texto dentro da caixa de informação
                titleColor: '#fff', // Cor do título dentro da caixa de informação
                borderColor: '#fff', // Cor da borda da caixa de informação
                borderWidth: 1, // Largura da borda da caixa de informação
            },
        },
        // Configurações para os eixos X e Y
        scales: {
            x: {
                title: {
                    display: true, // Exibe o título do eixo X
                    text: 'Hora', // Texto do título do eixo X
                    color: '#fff', // Cor do texto do título do eixo X
                },
                ticks: {
                    color: '#fff', // Cor dos rótulos do eixo X (as horas)
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Cor das linhas de grade do eixo X
                },
            },
            y: {
                title: {
                    display: true, // Exibe o título do eixo Y
                    text: 'Produção (kWh)', // Texto do título do eixo Y
                    color: '#fff', // Cor do texto do título do eixo Y
                },
                ticks: {
                    color: '#fff', // Cor dos rótulos do eixo Y (os valores de produção)
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Cor das linhas de grade do eixo Y
                },
            },
        },
    };

    // Opções específicas para o gráfico de linha de produção
    const productionOptions = {
        ...commonChartOptions, // Usa as opções comuns
        onClick: () => setExpandedChart('line'), // Ao clicar no gráfico, amplia o gráfico de linha
        plugins: {
            ...commonChartOptions.plugins,
            title: {
                display: true, // Exibe o título do gráfico
                text: 'Produção de Energia Solar Por Hora (Linha)', // Texto do título
                color: '#fff', // Cor do texto do título
            },
            tooltip: {
                ...commonChartOptions.plugins.tooltip,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y} kWh`; // Formata o valor e adiciona ' kWh'
                        }
                        return label;
                    },
                },
            },
        },
    };

    // Opções específicas para o gráfico de pizza de produção
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: () => setExpandedChart('pie'), // Ao clicar, amplia o gráfico de pizza
        plugins: {
            title: {
                display: true,
                text: 'Distribuição da Produção de Energia Solar Por Hora (Pizza)',
                color: '#fff',
            },
            legend: {
                labels: {
                    color: '#fff',
                },
                position: 'bottom', // Posição da legenda
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                bodyColor: '#fff',
                titleColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const value = context.raw; // Valor do pedaço
                        const total = context.dataset.data.reduce((a, b) => a + b, 0); // Soma de todos os valores
                        const percentage = Math.round((value / total) * 100); // Calcula a porcentagem
                        // Formata a legenda para mostrar valor e porcentagem
                        return `${context.label}: ${value} kWh (${percentage}%)`;
                    },
                },
            },
        },
    };

    // Opções específicas para o gráfico de barras de produção
    const barChartOptions = {
        ...commonChartOptions, // Usa as opções comuns
        onClick: () => setExpandedChart('bar'), // Ao clicar, amplia o gráfico de barras
        plugins: {
            ...commonChartOptions.plugins,
            title: {
                display: true,
                text: 'Produção de Energia Solar Por Hora (Barra)',
                color: '#fff',
            },
            tooltip: {
                ...commonChartOptions.plugins.tooltip,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y} kWh`; // Formata o valor e adiciona ' kWh'
                        }
                        return label;
                    },
                },
            },
        },
    };

    // Função para gerar dados aleatórios para simular a análise
    const generateRandomData = () => {
        const type = Math.floor(Math.random() * 4); // Escolhe um tipo de variação aleatória
        const base = [5, 10, 15, 20, 25, 20, 10]; // Uma base de dados

        // Aplica diferentes tipos de variações aos dados base
        switch (type) {
            case 0:
                return base.map((v) => v + Math.floor(Math.random() * 3 - 1)); // Pequenas variações
            case 1:
                return base.map((_, i) => Math.round(15 + 10 * Math.sin(i))); // Variação senoidal
            case 2:
                return Array.from({ length: 7 }, () => Math.floor(Math.random() * 35)); // Dados completamente aleatórios
            case 3:
                return [5, 12, 25, 35, 28, 18, 10].map((v) => v + Math.floor(Math.random() * 4 - 2)); // Outra variação
            default:
                return base; // Retorna os dados base se nenhum tipo for selecionado
        }
    };

    // Função chamada ao clicar no botão de "Analisar Produção"
    const handleAnalyzeClick = () => {
        setIsAnalyzing(true); // Indica que a análise está em andamento
        setTimeout(() => {
            // Após 2 segundos (simulando uma análise), gera novos dados aleatórios
            const newData = generateRandomData();
            // Atualiza o estado dos dados de produção com os novos dados
            setProductionData((prev) => ({
                ...prev,
                datasets: [
                    {
                        ...prev.datasets[0],
                        data: newData,
                    },
                ],
            }));
            setIsAnalyzing(false); // Indica que a análise terminou
        }, 2000);
    };

    // Função para mudar o tipo de gráfico a ser exibido
    const handleChartTypeChange = (type) => {
        setChartType(type);
    };

    // Função para fechar o gráfico ampliado
    const handleCloseExpandedChart = () => {
        setExpandedChart(null);
        setShareOptionsVisible(false); // Esconde as opções de compartilhamento ao fechar
    };

    // Hook useEffect que é executado uma vez quando o componente é montado
    useEffect(() => {
        // Gera dados aleatórios iniciais para o gráfico
        const newData = generateRandomData();
        setProductionData((prev) => ({
            ...prev,
            datasets: [
                {
                    ...prev.datasets[0],
                    data: newData,
                },
            ],
        }));
    }, []); // O array vazio significa que este efeito roda apenas na montagem

    // Dados simulados para o clima atual
    const currentWeather = {
        temperature: 28,
        condition: 'Ensolarado',
    };

    // Dados simulados para a previsão do tempo
    const forecast = [
        { time: '09:00', condition: 'Ensolarado' },
        { time: '12:00', condition: 'Nublado' },
        { time: '15:00', condition: 'Chuvoso' },
        { time: '18:00', condition: 'Nublado' },
    ];

    // Função para obter o ícone do clima com base na condição
    const getWeatherIcon = (condition) => {
        switch (condition) {
            case 'Ensolarado':
                return '☀️';
            case 'Nublado':
                return '☁️';
            case 'Chuvoso':
                return '🌧️';
            default:
                return '';
        }
    };

    // Função para salvar o gráfico como uma imagem
    const handleSaveChart = () => {
        const chart = chartRef.current; // Obtém a instância do gráfico
        if (chart && expandedChart) {
            const link = document.createElement('a');
            link.download = `grafico_producao_solar_${expandedChart}.png`; // Define o nome do arquivo
            link.href = chart.toBase64Image(); // Obtém a imagem do gráfico como um link de dados
            link.click(); // Simula um clique no link para iniciar o download
        }
    };

    // Função para mostrar/esconder as opções de compartilhamento
    const handleShareClick = () => {
        setShareOptionsVisible(!shareOptionsVisible);
    };

    // Função para compartilhar o gráfico por email
    const shareViaEmail = () => {
        const chart = chartRef.current;
        if (chart && expandedChart) {
            const imageUrl = chart.toBase64Image();
            const subject = 'Gráfico de Produção Solar';
            const body = 'Confira o gráfico de produção de energia solar em anexo.';
            // Cria um link mailto com o assunto, corpo e a imagem como anexo (alguns clientes de email podem não suportar anexos via mailto)
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&attachment=${encodeURIComponent(imageUrl.split(',')[1])}`;
            window.open(mailtoLink, '_blank'); // Abre o cliente de email
            setShareOptionsVisible(false);
        }
    };

    // Função para compartilhar o gráfico via WhatsApp
    const shareViaWhatsApp = () => {
        const chart = chartRef.current;
        if (chart && expandedChart) {
            const imageUrl = chart.toBase64Image();
            const text = 'Confira o gráfico de produção de energia solar: ' + imageUrl;
            // Cria um link para o WhatsApp com o texto contendo a URL da imagem
            const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappLink, '_blank'); // Abre o WhatsApp
            setShareOptionsVisible(false);
        }
    };

    // Função para compartilhar o gráfico via Instagram
    const shareViaInstagram = () => {
        alert('Compartilhar via Instagram geralmente envolve baixar a imagem e compartilhar manualmente no aplicativo.');
        setShareOptionsVisible(false);
        handleSaveChart(); // Sugere salvar para compartilhamento manual
    };

    // Função para compartilhar o gráfico via LinkedIn
    const shareViaLinkedIn = () => {
        const chart = chartRef.current;
        if (chart && expandedChart) {
            const imageUrl = chart.toBase64Image();
            const title = 'Gráfico de Produção Solar';
            const summary = 'Confira o gráfico de produção de energia solar.';
            const linkedinLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent(window.location.href)}`;
            window.open(linkedinLink, '_blank'); // Abre o LinkedIn para compartilhar
            setShareOptionsVisible(false);
        }
    };

    // Renderização do componente
    return (
        <div className="home-container">
            <main className="main-content">
                {/* Seção de produção de energia */}
                <section className="production-section">
                  <h2>Produção Atual</h2>
                    {/* Seletor de tipo de gráfico */}
                    <div className="chart-type-selector">
                        <label>Tipo de Gráfico:</label>
                        <div className="chart-buttons">
                            <button
                                onClick={() => handleChartTypeChange('line')}
                                className={chartType === 'line' ? 'active' : ''} // Adiciona classe 'active' ao botão selecionado
                            >
                                Linha
                            </button>
                            <button onClick={() => handleChartTypeChange('bar')}
                                className={chartType === 'bar' ? 'active' : ''}
                            >
                                Barra
                            </button>
                            <button
                                onClick={() => handleChartTypeChange('pie')}
                                className={chartType === 'pie' ? 'active' : ''}
                            >
                                Pizza
                            </button>
                        </div>
                    </div>
                    {/* Container para o gráfico */}
                    <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px' }}>
                        <div className="chart-container" onClick={() => setExpandedChart(chartType)}>
                            {/* Renderiza o gráfico de linha se o tipo selecionado for 'line' */}
                            {chartType === 'line' && <Line data={productionData} options={productionOptions} ref={chartRef} />}
                            {/* Renderiza o gráfico de barras se o tipo selecionado for 'bar' */}
                            {chartType === 'bar' && <Bar data={productionData} options={barChartOptions} ref={chartRef} />}
                            {/* Renderiza o gráfico de pizza se o tipo selecionado for 'pie' */}
                            {chartType === 'pie' && <Pie data={productionData} options={pieChartOptions} ref={chartRef} />}
                        </div>
                    </div>
                    {/* Botão para atualizar/analisar a produção */}
                    <button
                        className="analyze-button"
                        onClick={handleAnalyzeClick}
                        disabled={isAnalyzing} // Desabilita o botão durante a análise
                        style={{ marginTop: '35px' }}
                    >
                        {isAnalyzing ? 'Analisando...' : 'Atualizar Produção'}
                    </button>
                </section>

                {/* Seção de clima atual e previsão do tempo */}
                <section className="weather-section" style={{ backgroundColor: '#252525', color: '#fff', borderRadius: '8px', padding: '20px' }}>
                    <h2>Clima Atual</h2>
                    <div className="current-weather">
                        <p>Temperatura: {currentWeather.temperature}°C</p>
                        <p>Condição: {getWeatherIcon(currentWeather.condition)} {currentWeather.condition}</p>
                    </div>

                    <h2>Previsão do Tempo</h2>
                    <ul className="forecast-list">
                        {/* Mapeia os dados de previsão para exibir cada item */}
                        {forecast.map((item, index) => (
                            <li key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {item.time} - {getWeatherIcon(item.condition)} {item.condition}
                            </li>
                        ))}
                    </ul>
                </section>
                <br /><br /><br /> {/* Adiciona um espaço no final da seção principal */}
            </main>

            {/* Overlay que aparece quando o gráfico é ampliado */}
            {expandedChart && (
                <div className="expanded-chart-overlay" onClick={handleCloseExpandedChart}>
                    {/* Container para o gráfico ampliado */}
                    <div className="expanded-chart-container" onClick={(e) => e.stopPropagation()}>
                        {/* Botão de fechar o gráfico ampliado */}
                        <button className="close-button" onClick={handleCloseExpandedChart} title="Fechar">
                            X
                        </button>
                        {/* Container para o gráfico ampliado e a tabela de dados */}
                        <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
                            <div className="chart-container">
                                {/* Renderiza o gráfico de linha ampliado */}
                                {expandedChart === 'line' && <Line data={productionData} options={{ ...productionOptions, responsive: true, maintainAspectRatio: false }} />}
                                {/* Renderiza o gráfico de barras ampliado */}
                                {expandedChart === 'bar' && <Bar data={productionData} options={{ ...barChartOptions, responsive: true, maintainAspectRatio: false }} />}
                                {/* Renderiza o gráfico de pizza ampliado */}
                                {expandedChart === 'pie' && <Pie data={productionData} options={{ ...pieChartOptions, responsive: true, maintainAspectRatio: false }} />}
                            </div>

                            {/* Título da tabela de dados */}
                            <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center' }}>Dados de Produção</h3>
                            {/* Container para a tabela de dados com barra de rolagem horizontal se necessário */}
                            <div className="data-table-container" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #fff' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Hora</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Produção (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Mapeia os rótulos (horas) para criar as linhas da tabela */}
                                        {productionData.labels.map((label, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                <td style={{ padding: '8px' }}>{label}</td>
                                                <td style={{ padding: '8px' }}>{productionData.datasets[0].data[index]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Seção de ações do gráfico ampliado (salvar e compartilhar) */}
                        <div className="expanded-chart-actions">
                            <button onClick={handleSaveChart}>Salvar Imagem</button>
                            <div className="share-options">
                                {/* Botões de compartilhamento com ícones */}
                                <a onClick={shareViaEmail} title="Compartilhar por Email"><img src={logoGmail} alt="Email" className="icones" /></a>
                                <a onClick={shareViaWhatsApp} title="Compartilhar no WhatsApp"><img src={logoWhasapp} alt="WhatsApp" className="icones" /></a>
                                <a onClick={shareViaInstagram} title="Compartilhar no Instagram"><img src={logoInstagram} alt="Instagram" className="icones" /></a>
                                <a onClick={shareViaLinkedIn} title="Compartilhar no LinkedIn"><img src={logoLinkedin} alt="LinkedIn" className="icones" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;