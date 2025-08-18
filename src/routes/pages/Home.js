import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip } from 'chart.js';
import initialProductionData from '../../data/graficoHomeApi.json';
import { tituloPrincipal, graficos, relatorioDiário, dados, subTitulo, impacto, economia, descricaoEconomia, arvoresEquivalentes, absorcaoPorArvore, reducaoPoluicao, impactoDescricao } from '../../constants/Home/index.js';
import logoGmail from '../../imgs/imgHome/Logogmail.png';
import logoWhatsapp from '../../imgs/imgHome/Logowhatsapp.png';
import logoInstagram from '../../imgs/imgHome/Logoinstagram.png';
import logoLinkedin from '../../imgs/imgHome/Logolinkedin.png';

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
import '../../CSS/Home/impactoAmbiental.css';
import '../../CSS/Home/mediaScreen.css';
import '../../CSS/Home/weatherAnimations.css';
import '../../CSS/Home/relatorioConsumoDiario.css';
import '../../CSS/Home/imgAtrazDoGrafico.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip);

const COLORS = ['#ADD8E6', '#87CEFA', '#00BFFF', '#1E90FF', 'rgba(31,81,255,0.7)', '#0000FF', '#000080'];
const WEATHER_ICONS = { Ensolarado: '☀️', Nublado: '☁️', Chuvoso: '🌧️', 'Parcialmente Nublado': '⛅', 'Céu limpo': '☀️', 'Tempo nublado': '☁️', 'Chuva leve': '🌧️', Limpo: '☀️', 'Tempestade': '⛈️' };
const CO2_PER_KWH = 0.85;
const CO2_PER_TREE = 22;
const OPENWEATHER_API_KEY = "50b5d79d3b8c0475ba7dba090402b21c";

const Home = () => {
    const [currentChartType, setCurrentChartType] = useState(() => localStorage.getItem('preferredChartType') || 'line');
    const [expandedChartType, setExpandedChartType] = useState(null);
    const [chosenDatasetIndex, setChosenDatasetIndex] = useState(0);
    const [showReport, setShowReport] = useState(false);
    const [backgroundClass, setBackgroundClass] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    const chartRef = useRef(null);

    useEffect(() => {
        if (initialProductionData.datasetsOptions?.length)
            setChosenDatasetIndex(Math.floor(Math.random() * initialProductionData.datasetsOptions.length));
    }, []);

    useEffect(() => localStorage.setItem('preferredChartType', currentChartType), [currentChartType]);

    useEffect(() => {
        const updateBackground = () => {
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 6 && hour < 12) {
                setBackgroundClass('morning-bg');
            } else if (hour >= 12 && hour < 18) {
                setBackgroundClass('afternoon-bg');
            } else {
                setBackgroundClass('night-bg');
            }
        };
        updateBackground();
        const intervalId = setInterval(updateBackground, 60 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const productionData = useMemo(() => {
        if (!initialProductionData.datasetsOptions) return { labels: [], datasets: [] };
        const chosen = initialProductionData.datasetsOptions[chosenDatasetIndex] || initialProductionData.datasetsOptions[0];
        return {
            labels: initialProductionData.labels,
            datasets: [{ label: chosen.label, data: chosen.data, borderColor: "#0FF0FC", backgroundColor: "rgba(15,240,252,0.3)", fill: true, tension: 0.3 }]
        };
    }, [chosenDatasetIndex]);

    const totalProduction = useMemo(() => productionData.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0, [productionData]);

    const environmentalImpact = useMemo(() => ({
        co2Avoided: (totalProduction * CO2_PER_KWH).toFixed(2),
        equivalentTrees: Math.round((totalProduction * CO2_PER_KWH) / CO2_PER_TREE)
    }), [totalProduction]);

    const fetchWeather = async (city = 'São Paulo') => {
        setWeatherLoading(true);
        setWeatherError(null);
        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=pt_br`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=pt_br`;

            const [weatherRes, forecastRes] = await Promise.all([fetch(weatherUrl), fetch(forecastUrl)]);

            if (!weatherRes.ok || !forecastRes.ok) {
                const errorData = await (weatherRes.ok ? forecastRes.json() : weatherRes.json());
                throw new Error(errorData.message || "City not found.");
            }

            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();

            const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);
            const formattedForecast = dailyForecasts.map((item, index) => ({
                day: index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : 'Depois de Amanhã',
                condition: item.weather[0].description,
                high: item.main.temp_max,
                low: item.main.temp_min
            }));

            setWeatherData({
                current: {
                    temperature: weatherData.main.temp,
                    condition: weatherData.weather[0].description,
                    humidity: weatherData.main.humidity,
                    windSpeed: weatherData.wind.speed
                },
                forecast: formattedForecast
            });
        } catch (error) {
            setWeatherError(error.message);
            setWeatherData(null);
        } finally {
            setWeatherLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    const commonChartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } } },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)', bodyColor: '#fff', titleColor: '#fff', borderColor: '#fff', borderWidth: 1,
                bodyFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }, titleFont: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }
            }
        },
        scales: {
            x: { title: { display: true, text: 'Hora', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { title: { display: true, text: 'Produção (kWh)', color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, ticks: { color: '#fff', font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" } }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
    }), []);

    const getChartOptions = useCallback(type => ({
        ...commonChartOptions, onClick: () => setExpandedChartType(type),
        plugins: {
            ...commonChartOptions.plugins,
            title: { display: true, color: '#fff', text: type === 'pie' ? 'Distribuição da Produção de Energia Solar por Hora' : `Produção de Energia Solar por Hora (${type === 'line' ? 'Linha' : 'Barras'})`, font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", size: 16 } },
            legend: { ...commonChartOptions.plugins.legend, position: type === 'pie' ? 'bottom' : 'top' },
            tooltip: {
                ...commonChartOptions.plugins.tooltip,
                callbacks: {
                    label: ctx => type === 'pie' ? `${ctx.label}: ${ctx.raw} kWh (${Math.round((ctx.raw / ctx.dataset.data.reduce((a, v) => a + v, 0)) * 100)}%)` : `${ctx.dataset.label || ''}: ${ctx.parsed.y !== null ? ctx.parsed.y + ' kWh' : ''}`
                }
            }
        },
        scales: type === 'pie' ? {} : commonChartOptions.scales
    }), [commonChartOptions]);

    const getWeatherIcon = useCallback(c => {
        const normalizedCondition = c.toLowerCase().includes('sol') || c.toLowerCase().includes('céu limpo') ? 'Limpo' :
                                   c.toLowerCase().includes('nublado') ? 'Nublado' :
                                   c.toLowerCase().includes('chuva') ? 'Chuvoso' :
                                   c.toLowerCase().includes('parcialmente nublado') ? 'Parcialmente Nublado' : 'Limpo';
        return (
            <span className={`weather-icon ${normalizedCondition === 'Limpo' ? 'moon-animation' : normalizedCondition === 'Parcialmente Nublado' ? 'sun-cloud-animation' : normalizedCondition === 'Chuvoso' ? 'rain-cloud-animation' : ''}`}>
                {WEATHER_ICONS[normalizedCondition] || '❔'}
            </span>
        );
    }, []);

    const shareChart = useCallback(platform => {
        if (!chartRef.current || !expandedChartType) return alert('Por favor, visualize o gráfico expandido antes de tentar compartilhar.');
        const title = 'Gráfico de Produção Solar', summary = 'Confira o gráfico de produção de energia solar gerada pelo nosso sistema. É um passo importante para um futuro mais sustentável!';
        const encodedTitle = encodeURIComponent(title), encodedSummary = encodeURIComponent(summary);
        const link = document.createElement('a');
        link.download = `solar_production_chart_${expandedChartType}.png`;
        link.href = chartRef.current.toBase64Image();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
            const messages = {
                email: `A imagem do gráfico foi baixada! Agora, abra seu aplicativo de e-mail e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`,
                whatsapp: `A imagem do gráfico foi baixada! Abra o WhatsApp e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`,
                instagram: `A imagem do gráfico foi baixada! Abra o Instagram e anexe "solar_production_chart_${expandedChartType}.png".`,
                linkedin: `A imagem do gráfico foi baixada! Abra o LinkedIn e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`,
                default: 'A imagem do gráfico foi baixada! Compartilhe manualmente na plataforma desejada.'
            };
            alert(messages[platform] || messages.default);
            if (platform === 'email') window.open(`mailto:?subject=${encodedTitle}&body=${encodedSummary}`, '_blank');
            if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodedSummary}`, '_blank');
        }, 500);
    }, [expandedChartType]);

    const getChartData = useCallback(type => {
        if (!productionData.datasets?.length) return { labels: [], datasets: [] };
        const base = productionData.datasets[0];
        const common = { label: base.label, data: base.data, borderColor: "#1E90FF", borderWidth: 1 };
        if (type === 'line') return { labels: productionData.labels, datasets: [{ ...common, backgroundColor: "rgba(30,144,255,0.2)", fill: true, tension: 0.3 }] };
        if (type === 'bar') return { labels: productionData.labels, datasets: [{ ...common, backgroundColor: COLORS }] };
        if (type === 'pie') {
            const lLabels = productionData.labels.slice(0, 7), lData = base.data.slice(0, 7);
            return { labels: lLabels, datasets: [{ ...common, data: lData, backgroundColor: COLORS.slice(0, lLabels.length) }] };
        }
        return productionData;
    }, [productionData]);

    const ChartComponent = useMemo(() => ({ line: Line, bar: Bar, pie: Pie })[currentChartType], [currentChartType]);
    const ExpandedChartComponent = useMemo(() => ({ line: Line, bar: Bar, pie: Pie })[expandedChartType], [expandedChartType]);

    const generateDailyReport = useCallback(() => {
        if (!productionData.datasets[0]) return "Sem dados para relatório.";
        const { data } = productionData.datasets[0];
        const { labels } = productionData;
        const total = data.reduce((acc, v) => acc + v, 0).toFixed(2);
        const maxValue = Math.max(...data), maxIndex = data.indexOf(maxValue), maxHour = labels[maxIndex];
        const minValue = Math.min(...data), minIndex = data.indexOf(minValue), minHour = labels[minIndex];
        return `Relatório Diário:\n\nProdução total: ${total} kWh.\nMaior produção: ${maxHour} com ${maxValue} kWh.\nMenor produção: ${minHour} com ${minValue} kWh.`;
    }, [productionData]);

    const reportText = useMemo(() => generateDailyReport(), [generateDailyReport]);

    const displayForecast = weatherData?.forecast?.length > 0;
    const currentCondition = weatherData?.current?.condition;

    return (
        <div className="home-container">
            <div className={`fundoComimgAntesDografico ${backgroundClass}`}></div>
            <main className="main-content">
                <section className="production-section">
                    <div className='producao'>
                        <h2 className='tituloPrincipalHome'>{tituloPrincipal}</h2>
                        <div className="chart-type-selector">
                            <label className='tipoGrafico'>{graficos}</label>
                            <div className="chart-buttons" title='Gráfico'>
                                {['line', 'bar', 'pie'].map(t => (
                                    <button key={t} onClick={() => setCurrentChartType(t)} className={currentChartType === t ? 'active' : ''}>
                                        {t === 'line' ? 'Linha' : t === 'bar' ? 'Barra' : 'Pizza'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px' }}>
                            <div className="chart-container" onClick={() => setExpandedChartType(currentChartType)}>
                                {ChartComponent && <ChartComponent data={getChartData(currentChartType)} options={getChartOptions(currentChartType)} ref={chartRef} />}
                            </div>
                        </div>
                        <p className='paragrafoFonteGrafico'>{dados}</p>
                        <section className="daily-report-section" style={{ marginTop: '20px' }}>
                            <button onClick={() => setShowReport(true)} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#252525', color: '#fff', fontWeight: 'bold' }}>
                                {relatorioDiário}
                            </button>
                        </section>
                    </div>
                </section>

                <div className='impactoAmbiental'>
                    <section className="wf-section">
                        <h2>{subTitulo}</h2>
                        <div className="wf-card-container">
                            {weatherLoading ? (
                                <p className="loading-message">Carregando previsão do tempo...</p>
                            ) : weatherError ? (
                                <p className="error-message">Erro ao buscar clima: {weatherError}</p>
                            ) : (
                                <>
                                    {weatherData && (
                                        <div className="wf-card">
                                            <h3>Agora</h3>
                                            <p className="wf-temp">{Math.round(weatherData.current.temperature)}°C</p>
                                            <p className="wf-condition">
                                                {getWeatherIcon(weatherData.current.condition)} {weatherData.current.condition.charAt(0).toUpperCase() + weatherData.current.condition.slice(1)}
                                            </p>
                                            <p className="wf-details">Umidade: {weatherData.current.humidity}%</p>
                                            <p className="wf-details">Vento: {(weatherData.current.windSpeed * 3.6).toFixed(1)} km/h</p>
                                        </div>
                                    )}
                                    {displayForecast ? (
                                        weatherData.forecast.map((item, i) => (
                                            <div key={i} className="wf-card">
                                                <h3>{item.day}</h3>
                                                <p className="wf-icon">{getWeatherIcon(item.condition)}</p>
                                                <p className="wf-range">Min: {Math.round(item.low)}°C | Max: {Math.round(item.high)}°C</p>
                                                <p className="wf-condition-text">{item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-forecast-message">Previsão estendida não disponível.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>

                <section className="environmental-impact-section">
                    <h2>{impacto}</h2>
                    <div className="impact-cards-container">
                        <div className="impact-card">
                            <h3>{economia}</h3>
                            <p className="impact-value">{environmentalImpact.co2Avoided} kg</p>
                            <p className="impact-description">{descricaoEconomia}</p>
                        </div>
                        <div className="impact-card">
                            <h3>{arvoresEquivalentes}</h3>
                            <p className="impact-value">{environmentalImpact.equivalentTrees}</p>
                            <p className="impact-description">{absorcaoPorArvore}</p>
                        </div>
                        <div className="impact-card">
                            <h3>{reducaoPoluicao}</h3>
                            <p className="impact-description">{impactoDescricao}</p>
                        </div>
                    </div>
                </section>

                <br /><br /><br /><br /><br />
            </main>

            {showReport && (
                <div className="report-modal" onClick={() => setShowReport(false)}>
                    <div className="report-content" onClick={e => e.stopPropagation()}>
                        <button className="closeBtn" onClick={() => setShowReport(false)} title="Fechar">X</button>
                        <pre style={{ whiteSpace: 'pre-wrap', color: '#fff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", fontSize: '16px' }}>
                            {reportText}
                        </pre>
                    </div>
                </div>
            )}

            {expandedChartType && (
                <div className="expanded-chart-overlay" onClick={() => setExpandedChartType(null)}>
                    <div className="expanded-chart-container" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setExpandedChartType(null)} title="Fechar">X</button>
                        <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
                            <div className="chart-container">
                                {ExpandedChartComponent && <ExpandedChartComponent data={getChartData(expandedChartType)} options={getChartOptions(expandedChartType)} />}
                            </div>
                            <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }} title="Dados de Produção">Dados de Produção</h3>
                            <div className="data-table-container">
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #fff' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Hora</th>
                                            <th style={{ padding: '8px', textAlign: 'left', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>Produção (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionData.labels?.map((l, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{l}</td>
                                                <td style={{ padding: '8px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>{productionData.datasets?.[0]?.data[i]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="expanded-chart-actions">
                            <button onClick={() => {
                                if (chartRef.current && expandedChartType) {
                                    const link = document.createElement('a');
                                    link.download = `solar_production_chart_${expandedChartType}.png`;
                                    link.href = chartRef.current.toBase64Image();
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    alert(`A imagem "solar_production_chart_${expandedChartType}.png" foi salva em seu dispositivo!`);
                                }
                            }}>Salvar Imagem</button>
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