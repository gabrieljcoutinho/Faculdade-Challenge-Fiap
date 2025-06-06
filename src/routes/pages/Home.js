import React, { useState, useRef } from 'react';
import '../../CSS/Home/home.css';
import '../../CSS/Home/expanded.css';
import '../../CSS/Home/analyze.css';
import '../../CSS/Home/share.css';
import '../../CSS/Home/chart.css';
import '../../CSS/Home/closeBtn.css';
import '../../CSS/Home/forecast.css';
import '../../CSS/Home/weather.css';
import '../../CSS/Home/current.css';
import '../../CSS/Home/production.css';
import '../../CSS/Home/mediaScreen.css';
import { Line, Pie, Bar } from 'react-chartjs-2';
import logoGmail from '../../imgs/Logogmail.png';
import logoWhasapp from '../../imgs/Logowhatsapp.png';
import logoInstagram from '../../imgs/Logoinstagram.png';
import logoLinkedin from '../../imgs/Logolinkedin.png';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip);

// Home agora recebe 'productionData' e 'onUpdateProductionData' como props
const Home = ({ productionData, onUpdateProductionData }) => {
    // Define your color palette here. I've added an extra color to match your 7 data points.
    const chartColors = [
        '#87CEFA',
        '#87CEEB',
        '#ADD8E6',
        '#1E90FF',
       'rgba(31, 81, 255, 0.7)',
        '#0000FF',
         '#000080',
    ];

    // O estado 'productionData' foi removido daqui, ele vem via props.
    // Mantenha os outros estados locais para o controle da UI.
    const [state, setState] = useState({
        isAnalyzing: false,
        chartType: 'line',
        expandedChart: null,
        currentWeather: { temperature: 28, condition: 'Ensolarado' },
        forecast: [
            { day: 'Hoje', condition: 'Ensolarado', high: 30, low: 20 },
            { day: 'Amanhã', condition: 'Nublado', high: 25, low: 18 },
            { day: 'Depois de Amanhã', condition: 'Chuvoso', high: 22, low: 16 }
        ]
    });

    const chartRef = useRef(null);

    // Desestruture o estado local
    const { isAnalyzing, chartType, expandedChart, currentWeather, forecast } = state;

    const commonChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } } },
            tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', bodyColor: '#fff', titleColor: '#fff', borderColor: '#fff', borderWidth: 1, bodyFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }, titleFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }
        },
        scales: {
            x: { title: { display: true, text: 'Hora', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            y: { title: { display: true, text: 'Produção (kWh)', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
        }
    };

    const getChartOptions = (type) => ({
        ...commonChartOptions,
        onClick: () => setState(prev => ({ ...prev, expandedChart: type })),
        plugins: {
            ...commonChartOptions.plugins,
            title: {
                display: true, color: '#fff',
                text: type === 'pie' ? 'Distribuição da Produção de Energia Solar por Hora' : `Produção de Energia Solar por Hora (${type === 'line' ? 'Linha' : 'Barras'})`,
                font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", size: 16 }
            },
            ...(type === 'pie' && {
                legend: { ...commonChartOptions.plugins.legend, position: 'bottom', labels: { ...commonChartOptions.plugins.legend.labels, font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } } },
                tooltip: { ...commonChartOptions.plugins.tooltip, callbacks: { label: (context) => `${context.label}: ${context.raw} kWh (${Math.round((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100)}%)` } }
            }),
            ...(type !== 'pie' && { tooltip: { ...commonChartOptions.plugins.tooltip, callbacks: { label: (context) => `${context.dataset.label || ''}: ${context.parsed.y !== null ? `${context.parsed.y} kWh` : ''}` } } })
        },
        ...(type === 'pie' && { scales: {} })
    });

    const generateRandomData = () => {
        const base = [5, 10, 15, 20, 25, 20, 10];
        const type = Math.floor(Math.random() * 4);
        switch (type) {
            case 0: return base.map(v => v + Math.floor(Math.random() * 3 - 1));
            case 1: return base.map((_, i) => Math.round(15 + 10 * Math.sin(i)));
            case 2: return Array.from({ length: 7 }, () => Math.floor(Math.random() * 35));
            case 3: return [5, 12, 25, 35, 28, 18, 10].map(v => v + Math.floor(Math.random() * 4 - 2));
            default: return base;
        }
    };

    const handleAnalyzeClick = () => {
        setState(prev => ({ ...prev, isAnalyzing: true }));
        setTimeout(() => {
            const newData = {
                ...productionData,
                datasets: [{
                    ...productionData.datasets[0],
                    data: generateRandomData()
                }]
            };
            onUpdateProductionData(newData); // Chame a prop para atualizar o estado global
            setState(prev => ({ ...prev, isAnalyzing: false }));
        }, 2000);
    };

    const getWeatherIcon = (condition) => ({ 'Ensolarado': '☀️', 'Nublado': '☁️', 'Chuvoso': '🌧️' }[condition] || '');

    const handleSaveChart = () => {
        if (chartRef.current && expandedChart) {
            const link = document.createElement('a');
            link.download = `grafico_producao_solar_${expandedChart}.png`;
            link.href = chartRef.current.toBase64Image();
            link.click();
        }
    };

    const shareChart = (platform) => {
        if (!chartRef.current || !expandedChart) return;
        const imageUrl = chartRef.current.toBase64Image();
        const title = 'Gráfico de Produção Solar';
        const summary = 'Confira o gráfico de produção de energia solar.';

        const actions = {
            'email': () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(summary)}&attachment=${encodeURIComponent(imageUrl.split(',')[1])}`, '_blank'),
            'whatsapp': () => window.open(`https://wa.me/?text=${encodeURIComponent(`${summary} ${imageUrl}`)}`, '_blank'),
            'instagram': () => { alert('Compartilhe manualmente via Instagram'); handleSaveChart(); },
            'linkedin': () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank')
        };
        actions[platform]?.();
    };

    // Modify productionData based on chartType
    const getChartData = (type) => {
        if (type === 'bar' || type === 'pie') {
            return {
                labels: productionData.labels,
                datasets: [{
                    label: 'Produção (kWh)',
                    data: productionData.datasets[0].data,
                    backgroundColor: chartColors, // Use the defined colors
                    borderColor: '#fff',
                    borderWidth: 1,
                }]
            };
        }
        return productionData; // For line chart, return original productionData
    };

    const ChartComponent = { 'line': Line, 'bar': Bar, 'pie': Pie }[chartType];
    const ExpandedChartComponent = { 'line': Line, 'bar': Bar, 'pie': Pie }[expandedChart];

    return (
        <div className="home-container">
            <main className="main-content">
                <section className="production-section">
                    <h2>Produção Atual</h2>
                    <div className="chart-type-selector">
                        <label>Tipo de Gráfico:</label>
                        <div className="chart-buttons">
                            {['line', 'bar', 'pie'].map(type => (
                                <button key={type} onClick={() => setState(prev => ({ ...prev, chartType: type }))} className={chartType === type ? 'active' : ''}>
                                    {type === 'line' ? 'Linha' : type === 'bar' ? 'Barras' : 'Pizza'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px' }}>
                        <div className="chart-container" onClick={() => setState(prev => ({ ...prev, expandedChart: chartType }))}>
                            {ChartComponent && <ChartComponent data={getChartData(chartType)} options={getChartOptions(chartType)} ref={chartRef} />}
                        </div>
                    </div>
                    <button className="analyze-button" onClick={handleAnalyzeClick} disabled={isAnalyzing} style={{ marginTop: '35px' }}>
                        {isAnalyzing ? 'Analisando...' : 'Atualizar Produção'}
                    </button>
                </section>

                <section className="weather-forecast-section">
                    <h2>Clima e Previsão</h2>
                    <div className="weather-cards-container">
                        <div className="weather-card current-weather-card">
                            <h3>Agora</h3>
                            <p className="temperature">{currentWeather.temperature}°C</p>
                            <p className="condition">{getWeatherIcon(currentWeather.condition)} {currentWeather.condition}</p>
                        </div>
                        {forecast.map((item, index) => (
                            <div key={index} className="weather-card forecast-card">
                                <h3>{item.day}</h3>
                                <p className="condition">{getWeatherIcon(item.condition)}</p>
                                <p className="temp-range">Min: {item.low}°C | Max: {item.high}°C</p>
                                <p className="condition-text">{item.condition}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <br /><br /><br />
            </main>

            {expandedChart && (
                <div className="expanded-chart-overlay" onClick={() => setState(prev => ({ ...prev, expandedChart: null }))}>
                    <div className="expanded-chart-container" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setState(prev => ({ ...prev, expandedChart: null }))} title="Fechar">X</button>
                        <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
                            <div className="chart-container">
                                {ExpandedChartComponent && <ExpandedChartComponent data={getChartData(expandedChart)} options={getChartOptions(expandedChart)} />}
                            </div>
                            <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Dados de Produção</h3>
                            <div className="data-table-container">
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #fff' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Hora</th>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Produção (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionData.labels.map((label, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{label}</td>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{productionData.datasets[0].data[index]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="expanded-chart-actions">
                            <button onClick={handleSaveChart}>Salvar Imagem</button>
                            <div className="share-options">
                                <a onClick={() => shareChart('email')} title="Compartilhar por Email"><img src={logoGmail} alt="Email" className="icones" /></a>
                                <a onClick={() => shareChart('whatsapp')} title="Compartilhar no WhatsApp"><img src={logoWhasapp} alt="WhatsApp" className="icones" /></a>
                                <a onClick={() => shareChart('instagram')} title="Compartilhar no Instagram"><img src={logoInstagram} alt="Instagram" className="icones" /></a>
                                <a onClick={() => shareChart('linkedin')} title="Compartilhar no LinkedIn"><img src={logoLinkedin} alt="LinkedIn" className="icones" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;