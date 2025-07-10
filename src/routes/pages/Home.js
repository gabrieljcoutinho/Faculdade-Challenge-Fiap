import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
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

import { Line, Pie, Bar } from 'react-chartjs-2';
import logoGmail from '../../imgs/Logogmail.png';
import logoWhatsapp from '../../imgs/Logowhatsapp.png';
import logoInstagram from '../../imgs/Logoinstagram.png';
import logoLinkedin from '../../imgs/Logolinkedin.png';

import initialProductionData from '../../data/graficoHomeApi.json';

import {tituloPrincipal, graficos, dados, subTitulo, impacto, economia, descricaoEconomia,
  arvoresEquivalentes, absorcaoPorArvore, reducaoPoluicao,impactoDescricao } from '../../constants/Home/index.js'; // Importando constante de teste

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

const BAR_PIE_CHART_COLORS = [
  '#ADD8E6', '#87CEFA',  '#00BFFF',  '#1E90FF',
  'rgba(31, 81, 255, 0.7)', '#0000FF', '#000080',
];

const WEATHER_ICONS = {
  'Ensolarado': '☀️',
  'Nublado': '☁️',
  'Chuvoso': '🌧️',
  'Parcialmente Nublado': '⛅',
  'Limpo': '🌙'
};

const CO2_SAVED_PER_KWH = 0.85; // kg CO2 per kWh
const CO2_ABSORBED_PER_TREE_PER_YEAR = 22; // kg CO2 per tree per year (average)

const Home = () => {
  // --- Start of modifications for persistence ---
  // Initialize currentChartType from localStorage or default to 'line'
  const [currentChartType, setCurrentChartType] = useState(() => {
    const savedChartType = localStorage.getItem('preferredChartType');
    return savedChartType || 'line';
  });

  // Effect to save currentChartType to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('preferredChartType', currentChartType);
  }, [currentChartType]);
  // --- End of modifications for persistence ---

  // Estado para tipo de gráfico expandido
  const [expandedChartType, setExpandedChartType] = useState(null);
  // Índice do dataset escolhido aleatoriamente
  const [chosenDatasetIndex, setChosenDatasetIndex] = useState(0);

  // Ref para o gráfico
  const chartRef = useRef(null);

  // Ao montar, escolhe um dataset aleatório dos disponíveis no JSON
  useEffect(() => {
    if (initialProductionData.datasetsOptions && initialProductionData.datasetsOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * initialProductionData.datasetsOptions.length);
      setChosenDatasetIndex(randomIndex);
    }
  }, []);

  // Monta os dados do gráfico com o dataset aleatório escolhido
  const productionData = useMemo(() => {
    if (!initialProductionData.datasetsOptions) return { labels: [], datasets: [] };

    const chosenDataset = initialProductionData.datasetsOptions[chosenDatasetIndex] || initialProductionData.datasetsOptions[0];

    return {
      labels: initialProductionData.labels,
      datasets: [{
        label: chosenDataset.label,
        data: chosenDataset.data,
        borderColor: "#0FF0FC",
        backgroundColor: "rgba(15, 240, 252, 0.3)",
        fill: true,
        tension: 0.3
      }]
    };
  }, [chosenDatasetIndex]);

  // Total produção para cálculo de impacto ambiental
  const totalProduction = useMemo(() => {
    if (productionData.datasets.length > 0) {
      return productionData.datasets[0].data.reduce((sum, v) => sum + v, 0);
    }
    return 0;
  }, [productionData]);

  const environmentalImpact = useMemo(() => {
    const co2Avoided = (totalProduction * CO2_SAVED_PER_KWH).toFixed(2);
    const equivalentTrees = (co2Avoided / CO2_ABSORBED_PER_TREE_PER_YEAR).toFixed(0);
    return { co2Avoided, equivalentTrees };
  }, [totalProduction]);

  // Dados de clima fixos (exemplo São Paulo, noite 29/06/2025)
  const [currentWeather] = useState({ temperature: 18, condition: 'Limpo' });
  const [forecast] = useState([
    { day: 'Hoje', condition: 'Limpo', high: 22, low: 12 },
    { day: 'Amanhã', condition: 'Parcialmente Nublado', high: 21, low: 11 },
    { day: 'Depois de Amanhã', condition: 'Chuvoso', high: 18, low: 10 }
  ]);

  // Opções comuns para os gráficos
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

  // Gera opções específicas para cada tipo de gráfico
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
      options.scales = {};
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

  const getWeatherIcon = useCallback((condition) => WEATHER_ICONS[condition] || '', []);

  // Removendo handleSaveChart, pois sua lógica será incorporada diretamente no shareChart

  const shareChart = useCallback((platform) => {
    if (!chartRef.current || !expandedChartType) {
      alert('Por favor, visualize o gráfico expandido antes de tentar compartilhar.');
      return;
    }

    const title = 'Gráfico de Produção Solar';
    const summary = 'Confira o gráfico de produção de energia solar gerada pelo nosso sistema. É um passo importante para um futuro mais sustentável!';
    const encodedTitle = encodeURIComponent(title);
    const encodedSummary = encodeURIComponent(summary);

    // Salvar a imagem primeiro
    const link = document.createElement('a');
    link.download = `solar_production_chart_${expandedChartType}.png`;
    link.href = chartRef.current.toBase64Image();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Fornecer instruções personalizadas após o download ser iniciado
    setTimeout(() => { // Pequeno atraso para permitir que o download comece
      switch (platform) {
        case 'email':
          alert('A imagem do gráfico foi baixada! Agora, abra seu aplicativo de e-mail, crie uma nova mensagem e anexe a imagem "solar_production_chart_' + expandedChartType + '.png" que você acabou de baixar. Você pode colar o seguinte texto no corpo do e-mail:\n\n' + decodeURIComponent(encodedSummary));
          window.open(`mailto:?subject=${encodedTitle}&body=${encodedSummary}`, '_blank');
          break;
        case 'whatsapp':
          alert('A imagem do gráfico foi baixada! Abra o WhatsApp, selecione o contato ou grupo com quem deseja compartilhar e anexe a imagem "solar_production_chart_' + expandedChartType + '.png". Você pode colar o seguinte texto:\n\n' + decodeURIComponent(encodedSummary));
          window.open(`https://wa.me/?text=${encodedSummary}`, '_blank');
          break;
        case 'instagram':
          alert('A imagem do gráfico foi baixada! Abra o aplicativo do Instagram, toque no botão "+" para criar uma nova postagem ou história e selecione a imagem "solar_production_chart_' + expandedChartType + '.png".');
          // Instagram não suporta compartilhamento direto da web para upload de imagem.
          break;
        case 'linkedin':
          alert('A imagem do gráfico foi baixada! Abra o LinkedIn, clique em "Iniciar uma publicação", e anexe a imagem "solar_production_chart_' + expandedChartType + '.png". Você também pode incluir o seguinte texto na sua publicação:\n\n' + decodeURIComponent(encodedSummary));
          // LinkedIn não suporta compartilhamento direto da web para upload de imagem.
          break;
        default:
          alert('A imagem do gráfico foi baixada! Por favor, compartilhe-a manualmente na plataforma de sua escolha.');
          break;
      }
    }, 500); // Ajuste o atraso se necessário
  }, [expandedChartType]);

  const getChartData = useCallback((type) => {
    if (!productionData.datasets || productionData.datasets.length === 0) {
      return { labels: [], datasets: [] };
    }

    const baseDataset = productionData.datasets[0];
    const commonDatasetProps = {
      label: baseDataset.label,
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
            tension: 0.3
          }]
        };
      case 'bar':
        return {
          labels: productionData.labels,
          datasets: [{
            ...commonDatasetProps,
            backgroundColor: BAR_PIE_CHART_COLORS,
          }]
        };
      case 'pie':
        // Limit to 7 data points for the pie chart
        const limitedLabels = productionData.labels.slice(0, 7);
        const limitedData = baseDataset.data.slice(0, 7);
        return {
          labels: limitedLabels,
          datasets: [{
            ...commonDatasetProps,
            data: limitedData,
            backgroundColor: BAR_PIE_CHART_COLORS.slice(0, limitedLabels.length), // Ensure colors match the number of slices
          }]
        };
      default:
        return productionData;
    }
  }, [productionData]);

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
          <h2 className='tituloPrincipalHome'>{tituloPrincipal}</h2>
          <div className="chart-type-selector">
            <label className='tipoGrafico'>{graficos}</label>
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
          <p className='paragrafoFonteGrafico'>{dados}</p>
        </section>

        <section className="weather-forecast-section">
          <h2>{subTitulo}</h2>
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

      {expandedChartType && (
        <div className="expanded-chart-overlay" onClick={() => setExpandedChartType(null)}>
          <div className="expanded-chart-container" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setExpandedChartType(null)} title="Fechar">X</button>
            <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
              <div className="chart-container">
                {ExpandedChartComponent && (
                  <ExpandedChartComponent
                    data={getChartData(expandedChartType)}
                    options={getChartOptions(expandedChartType)}
                  />
                )}
              </div>
              <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }} title="Dados de Produção" >Dados de Produção</h3>
              <div className="data-table-container">
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
              {/* O botão "Salvar Imagem" agora apenas dispara o download, o compartilhamento vai na função shareChart */}
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