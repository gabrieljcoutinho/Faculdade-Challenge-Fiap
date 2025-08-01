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
import '../../CSS/Home/paletaCoresGrafico.css';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip);

const WEATHER_ICONS = { Ensolarado: '☀️', Nublado: '☁️', Chuvoso: '🌧️', 'Parcialmente Nublado': '⛅', Limpo: '🌙' };
const CO2_PER_KWH = 0.85;
const CO2_PER_TREE = 22;

const COLOR_PALETTES = {
    blue: {
        background: ["rgba(15,240,252,0.3)", "rgba(30,144,255,0.2)"],
         border: ["#0FF0FC", "#1E90FF"],
        pie: ['#ADD8E6', '#87CEFA', '#00BFFF', '#1E90FF', 'rgba(31,81,255,0.7)', '#0000FF', '#000080']
    },
    green: {
        background: ["rgba(144,238,144,0.3)", "rgba(50,205,50,0.2)"],
       border: ["#90EE90", "#32CD32"],
        pie: ['#90EE90', '#3CB371', '#2E8B57', '#008000', '#006400', '#556B2F']
    },
    pink: {
        background: ["rgba(255,192,203,0.3)", "rgba(255,105,180,0.2)"],
        border: ["#FFC0CB", "#FF69B4"],
        pie: ['#FFC0CB', '#FF69B4', '#FF1493', '#C71585', '#8B008B', '#4B0082']
    },
orange: {
    background: ["rgba(255,165,0,0.3)", "rgba(255,140,0,0.2)"],
    border: ["#FFA500", "#FF8C00"],
    pie: ['#FFA500', '#FFD700', '#FF7F50', '#F08080', '#CD5C5C', '#B22222', '#F0E68C']
}
};

const Home = () => {
    const [currentChartType, setCurrentChartType] = useState(() => localStorage.getItem('preferredChartType') || 'line');
    const [expandedChartType, setExpandedChartType] = useState(null);
    const [chosenDatasetIndex, setChosenDatasetIndex] = useState(0);
    const [showReport, setShowReport] = useState(false);
    const [backgroundClass, setBackgroundClass] = useState('');
    const [colorPalette, setColorPalette] = useState(() => localStorage.getItem('colorPalette') || 'blue');

    const chartRef = useRef(null);

    useEffect(() => {
        if (initialProductionData.datasetsOptions?.length)
            setChosenDatasetIndex(Math.floor(Math.random() * initialProductionData.datasetsOptions.length));
    }, []);

    useEffect(() => localStorage.setItem('preferredChartType', currentChartType), [currentChartType]);
    useEffect(() => localStorage.setItem('colorPalette', colorPalette), [colorPalette]);

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

    const [currentWeather] = useState({ temperature: 18, condition: 'Limpo' });
    const [forecast] = useState([
        { day: 'Hoje', condition: 'Limpo', high: 22, low: 12 },
        { day: 'Amanhã', condition: 'Parcialmente Nublado', high: 21, low: 11 },
        { day: 'Depois de Amanhã', condition: 'Chuvoso', high: 18, low: 10 }
    ]);

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

    const getWeatherIcon = useCallback(c => (
        <span className={`weather-icon ${c === 'Limpo' ? 'moon-animation' : c === 'Parcialmente Nublado' ? 'sun-cloud-animation' : c === 'Chuvoso' ? 'rain-cloud-animation' : ''}`}>
            {WEATHER_ICONS[c] || ''}
        </span>
    ), []);

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
        const selectedPalette = COLOR_PALETTES[colorPalette];

        if (!selectedPalette) return productionData;

        const common = {
            label: base.label,
            data: base.data,
            borderColor: selectedPalette.border[0],
            borderWidth: 1
        };

        if (type === 'line') return {
            labels: productionData.labels,
            datasets: [{ ...common, backgroundColor: selectedPalette.background[0], fill: true, tension: 0.3 }]
        };

        if (type === 'bar') return {
            labels: productionData.labels,
            datasets: [{ ...common, backgroundColor: selectedPalette.pie }]
        };

        if (type === 'pie') {
            const lLabels = productionData.labels.slice(0, 7),
            lData = base.data.slice(0, 7);
            return {
                labels: lLabels,
                datasets: [{
                    ...common,
                    data: lData,
                    backgroundColor: selectedPalette.pie.slice(0, lLabels.length)
                }]
            };
        }

        return productionData;
    }, [productionData, colorPalette]);

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

    return (
        <div className="home-container">
            <div className={`fundoComimgAntesDografico ${backgroundClass}`}></div>
            <main className="main-content">
                <section className="production-section">
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

                    <div className="color-palette-selector">
                        <label className='paletaCores'>Paleta de Cores</label>
                        <div className="palette-buttons">
                            {Object.keys(COLOR_PALETTES).map(paletteName => (
                                <button
                                    key={paletteName}
                                    onClick={() => setColorPalette(paletteName)}
                                    className={colorPalette === paletteName ? 'active-palette' : ''}
                                    style={{ backgroundColor: COLOR_PALETTES[paletteName].pie[0] }}
                                    title={paletteName}
                                ></button>
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
                </section>

                <section className="wf-section">
                    <h2>{subTitulo}</h2>
                    <div className="wf-card-container">
                        <div className="wf-card">
                            <h3>Agora</h3>
                            <p className="wf-temp">{currentWeather.temperature}°C</p>
                            <p className="wf-condition">{getWeatherIcon(currentWeather.condition)} {currentWeather.condition}</p>
                        </div>
                        {forecast.map((item, i) => (
                            <div key={i} className="wf-card">
                                <h3>{item.day}</h3>
                                <p className="wf-icon">{getWeatherIcon(item.condition)}</p>
                                <p className="wf-range">Min: {item.low}°C | Max: {item.high}°C</p>
                                <p className="wf-condition-text">{item.condition}</p>
                            </div>
                        ))}
                    </div>
                </section>

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