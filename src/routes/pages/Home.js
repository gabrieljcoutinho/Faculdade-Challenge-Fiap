import React, { useState, useRef, useMemo, useCallback } from 'react';
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
import logoWhatsapp from '../../imgs/Logowhatsapp.png';
import logoInstagram from '../../imgs/Logoinstagram.png';
import logoLinkedin from '../../imgs/Logolinkedin.png';
import initialProductionData from '../../data/graficoHomeApi.json';
import {
    Chart as ChartJS,
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
} from 'chart.js';

// Register necessary Chart.js components
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

// Constants for chart colors
const BAR_PIE_CHART_COLORS = [
    '#87CEFA', '#87CEEB', '#ADD8E6', '#1E90FF',
    'rgba(31, 81, 255, 0.7)', '#0000FF', '#000080',
];

// Weather icon mapping
const WEATHER_ICONS = {
    'Ensolarado': '☀️',
    'Nublado': '☁️',
    'Chuvoso': '🌧️',
    'Parcialmente Nublado': '⛅',
    'Limpo': '🌙' // Adicionado para indicar céu limpo à noite
};

const Home = () => {
    // UI state management
    const [currentChartType, setCurrentChartType] = useState('line');
    const [expandedChartType, setExpandedChartType] = useState(null); // Stores the type of the currently expanded chart

    // State for production data, initialized directly from the imported JSON
    const [productionData] = useState(initialProductionData); // This data will now be static

    // Realistic sample data for weather and forecast for São Paulo, June 29, 2025, 19:45
    const [currentWeather] = useState({ temperature: 18, condition: 'Limpo' }); // Ajustado para noite em SP, céu limpo
    const [forecast] = useState([
        { day: 'Hoje', condition: 'Limpo', high: 22, low: 12 }, // June 29, 2025 (Reflete o dia e a noite atual)
        { day: 'Amanhã', condition: 'Parcialmente Nublado', high: 21, low: 11 }, // June 30, 2025
        { day: 'Depois de Amanhã', condition: 'Chuvoso', high: 18, low: 10 } // July 1, 2025
    ]);

    // Ref for the main chart element to capture its image
    const chartRef = useRef(null);

    // Common chart options memoized for performance
    const commonChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#fff',
                    font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                bodyColor: '#fff',
                titleColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                bodyFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
                titleFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Hora', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } },
                ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                title: { display: true, text: 'Produção (kWh)', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } },
                ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    }), []);

    // Function to get specific chart options based on type, memoized
    const getChartOptions = useCallback((type) => {
        const options = {
            ...commonChartOptions,
            onClick: () => setExpandedChartType(type),
            plugins: {
                ...commonChartOptions.plugins,
                title: {
                    display: true,
                    color: '#fff',
                    text: type === 'pie' ? 'Distribuição da Produção de Energia Solar por Hora' : `Produção de Energia Solar por Hora (${type === 'line' ? 'Linha' : 'Barras'})`,
                    font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", size: 16 }
                },
            },
        };

        if (type === 'pie') {
            options.plugins.legend = {
                ...options.plugins.legend,
                position: 'bottom',
                labels: {
                    ...options.plugins.legend.labels,
                    font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
                }
            };
            options.plugins.tooltip = {
                ...options.plugins.tooltip,
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = Math.round((context.raw / total) * 100);
                        return `${context.label}: ${context.raw} kWh (${percentage}%)`;
                    }
                }
            };
            options.scales = {}; // Pie charts do not have X and Y scales
        } else {
            options.plugins.tooltip = {
                ...options.plugins.tooltip,
                callbacks: {
                    label: (context) => `${context.dataset.label || ''}: ${context.parsed.y !== null ? `${context.parsed.y} kWh` : ''}`
                }
            };
        }
        return options;
    }, [commonChartOptions]);

    // Gets the weather icon based on condition
    const getWeatherIcon = useCallback((condition) => WEATHER_ICONS[condition] || '', []);

    // Handles saving the expanded chart image
    const handleSaveChart = useCallback(() => {
        if (chartRef.current && expandedChartType) {
            const link = document.createElement('a');
            link.download = `solar_production_chart_${expandedChartType}.png`;
            link.href = chartRef.current.toBase64Image();
            document.body.appendChild(link); // Append to body to ensure it's clickable
            link.click();
            document.body.removeChild(link); // Clean up
        }
    }, [expandedChartType]);

    // Handles sharing the chart on different platforms
    const shareChart = useCallback((platform) => {
        if (!chartRef.current || !expandedChartType) return;

        const title = 'Gráfico de Produção Solar';
        const summary = 'Confira o gráfico de produção de energia solar.';
        const encodedTitle = encodeURIComponent(title);
        const encodedSummary = encodeURIComponent(summary);

        const actions = {
            'email': () => {
                alert('Para compartilhar por e-mail, por favor, salve o gráfico e anexe-o ao seu e-mail manualmente. A incorporação direta de imagens não é amplamente suportada.');
                window.open(`mailto:?subject=${encodedTitle}&body=${encodedSummary}`, '_blank');
            },
            'whatsapp': () => {
                alert('Para compartilhar no WhatsApp, você precisará salvar a imagem primeiro e depois anexá-la à sua conversa.');
                window.open(`https://wa.me/?text=${encodedSummary}`, '_blank');
            },
            'instagram': () => {
                alert('Para compartilhar no Instagram, você precisará salvar a imagem e fazer o upload manualmente através do aplicativo.');
            },
            'linkedin': () => {
                alert('Para compartilhar no LinkedIn, você precisará salvar a imagem e fazer o upload manualmente, ou compartilhar um link para esta página se ela estiver online.');
                // If you have a live URL for your app, you could share that instead:
                // window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodedTitle}&summary=${encodedSummary}`, '_blank');
            }
        };
        actions[platform]?.();
    }, [expandedChartType]);

    // Adapts production data for different chart types
    const getChartData = useCallback((type) => {
        if (!productionData || !productionData.datasets || productionData.datasets.length === 0) {
            return { labels: [], datasets: [] };
        }

        const baseDataset = productionData.datasets[0];
        const commonDatasetProps = {
            label: 'Produção (kWh)',
            data: baseDataset.data,
            borderColor: "#1E90FF",
            borderWidth: 1,
        };

        switch (type) {
            case 'line':
                return {
                    labels: productionData.labels,
                    datasets: [{
                        ...commonDatasetProps,
                        backgroundColor: "rgba(30, 144, 255, 0.2)",
                        fill: true,
                    }]
                };
            case 'bar':
            case 'pie':
                return {
                    labels: productionData.labels,
                    datasets: [{
                        ...commonDatasetProps,
                        backgroundColor: BAR_PIE_CHART_COLORS,
                    }]
                };
            default:
                return productionData;
        }
    }, [productionData]);

    // Dynamically select the Chart.js component
    const ChartComponent = useMemo(() => ({
        'line': Line,
        'bar': Bar,
        'pie': Pie
    })[currentChartType], [currentChartType]);

    const ExpandedChartComponent = useMemo(() => ({
        'line': Line,
        'bar': Bar,
        'pie': Pie
    })[expandedChartType], [expandedChartType]);


    return (
        <div className="home-container">
            <main className="main-content">
                <section className="production-section">
                    <h2 className='tituloPrincipalHome'>Produção Atual</h2>
                    <div className="chart-type-selector">
                        <label className='tipoGrafico'>Tipo de Gráfico:</label>
                        <div className="chart-buttons" title='Grafico'>
                            {['line', 'bar', 'pie'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setCurrentChartType(type)}
                                    className={currentChartType === type ? 'active' : ''}
                                >
                                    {type === 'line' ? 'Linha' : type === 'bar' ? 'Barra' : 'Pizza'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px' }}>
                        {/* Main production chart */}
                        <div className="chart-container" onClick={() => setExpandedChartType(currentChartType)}>
                            {ChartComponent && (
                                <ChartComponent
                                    data={getChartData(currentChartType)}
                                    options={getChartOptions(currentChartType)}
                                    ref={chartRef}
                                />
                            )}
                        </div>
                    </div>
                    <p className='paragrafoFonteGrafico'>Fonte: Placas GoodWe</p>
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

                <br /><br /><br /><br /><br />
            </main>

            {/* Expanded Chart Overlay */}
            {expandedChartType && (
                <div className="expanded-chart-overlay" onClick={() => setExpandedChartType(null)}>
                    <div className="expanded-chart-container" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setExpandedChartType(null)} title="Fechar">X</button>
                        <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
                            <div className="chart-container">
                                {/* Render the expanded chart */}
                                {ExpandedChartComponent && (
                                    <ExpandedChartComponent
                                        data={getChartData(expandedChartType)}
                                        options={getChartOptions(expandedChartType)}
                                    />
                                )}
                            </div>
                            <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }} title="Dados de Produção" >Dados de Produção</h3>
                            <div className="data-table-container">
                                {/* Table with raw data */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #fff' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Hora</th>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Produção (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionData.labels && productionData.labels.map((label, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{label}</td>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{productionData.datasets && productionData.datasets[0] && productionData.datasets[0].data[index]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="expanded-chart-actions">
                            <button onClick={handleSaveChart}>Salvar Imagem</button>
                            <div className="share-options">
                                <a href="#!" onClick={() => shareChart('email')} title="Compartilhar por Email"><img src={logoGmail} alt="Email" className="icones" /></a>
                                <a href="#!" onClick={() => shareChart('whatsapp')} title="Compartilhar no WhatsApp"><img src={logoWhatsapp} alt="WhatsApp" className="icones" /></a>
                                <a href="#!" onClick={() => shareChart('instagram')} title="Compartilhar no Instagram"><img src={logoInstagram} alt="Instagram" className="icones" /></a>
                                <a href="#!" onClick={() => shareChart('linkedin')} title="Compartilhar no LinkedIn"><img src={logoLinkedin} alt="LinkedIn" className="icones" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;