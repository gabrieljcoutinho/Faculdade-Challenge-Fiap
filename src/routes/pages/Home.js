import React, { useState, useEffect, useRef } from 'react';

import '../../CSS/Home/home.css';
import '../../CSS/Home/expanded.css';
import '../../CSS/Home/analyze.css'
import '../../CSS/Home/share.css'
import '../../CSS/Home/chart.css'
import '../../CSS/Home/closeBtn.css'
import '../../CSS/Home/forecast.css'
import '../../CSS/Home/weather.css'
import '../../CSS/Home/current.css'
import '../../CSS/Home/production.css'
import '../../CSS/Home/mediaScreen.css'

import { Line, Pie, Bar } from 'react-chartjs-2';

import logoGmail from '../../imgs/Logogmail.png';
import logoWhasapp from '../../imgs/Logowhatsapp.png'
import logoInstagram from '../../imgs/Logoinstagram.png'
import logoLinkedin from '../../imgs/Logolinkedin.png'

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
  Legend
);

const Home = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [productionData, setProductionData] = useState({
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      {
        label: 'Produção (kWh)',
        data: [5, 12, 25, 30, 22, 15, 8],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        tension: 0.4,
      },
    ],
  });

  const chartRef = useRef(null);
  const [expandedChart, setExpandedChart] = useState(null);
  const [shareOptionsVisible, setShareOptionsVisible] = useState(false);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 28,
    condition: 'Ensolarado',
  });
  const [simulationCondition, setSimulationCondition] = useState('Ensolarado');

  const productionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: () => setExpandedChart('line'),
    plugins: {
      title: {
        display: true,
        text: 'Produção de Energia Solar Por Hora',
        color: '#fff',
      },
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Hora',
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'kWh',
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: () => setExpandedChart('pie'),
    plugins: {
      title: {
        display: true,
        text: 'Produção de Energia Solar por Hora',
        color: '#fff',
      },
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: () => setExpandedChart('bar'),
    plugins: {
      title: {
        display: true,
        text: 'Produção de Energia Solar por Hora',
        color: '#fff',
      },
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hora',
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'kWh',
          color: '#fff',
        },
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const generateRandomData = (weatherCondition) => {
    const baseSunny = [5, 15, 30, 35, 28, 18, 10];
    const baseCloudy = [0.5, 2, 4, 5, 3, 2, 1]; // Valores reduzidos para nublado
    const baseRainyLight = [0.2, 1, 2, 3, 1.5, 1, 0.5]; // Valores ainda mais baixos para chuva leve
    const baseRainyHeavy = [0, 0.1, 0.3, 0.5, 0.3, 0.2, 0.1]; // Valores muito baixos para chuva forte
    const baseVerySunny = [7, 20, 40, 45, 35, 25, 12];
    const baseNight = [0, 0, 0, 0, 0, 0, 0];

    switch (weatherCondition) {
      case 'Ensolarado':
        return baseSunny.map((v) => v + Math.floor(Math.random() * 5 - 2));
      case 'Nublado':
        return baseCloudy.map((v) => v + Math.floor(Math.random() * 3 - 1));
      case 'Chuvoso':
        return baseRainyLight.map((v) => v + Math.floor(Math.random() * 2 - 1));
      case 'Chuvoso Forte':
        return baseRainyHeavy.map((v) => v + Math.floor(Math.random() * 1));
      case 'Sol Muito Quente':
        return baseVerySunny.map((v) => v + Math.floor(Math.random() * 6 - 3));
      case 'Noite':
        return baseNight;
      default:
        return baseSunny.map((v) => v + Math.floor(Math.random() * 3 - 1));
    }
  };

  const handleAnalyzeClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const newData = generateRandomData(simulationCondition);
      setProductionData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: newData,
            label: `Produção (kWh) - ${simulationCondition}`,
          },
        ],
      }));
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleCloseExpandedChart = () => {
    setExpandedChart(null);
    setShareOptionsVisible(false);
  };

  useEffect(() => {
    const initialData = generateRandomData(currentWeather.condition);
    setProductionData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: initialData,
        },
      ],
    }));
  }, [currentWeather.condition]);

  const forecast = [
    { time: '09:00', condition: 'Ensolarado' },
    { time: '12:00', condition: 'Nublado' },
    { time: '15:00', condition: 'Chuvoso' },
    { time: '18:00', condition: 'Nublado' },
  ];

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Ensolarado':
        return '☀️';
      case 'Nublado':
        return '☁️';
      case 'Chuvoso':
        return '🌧️';
      case 'Chuvoso Forte':
        return '⛈️';
      case 'Sol Muito Quente':
        return '🔥';
      default:
        return '';
    }
  };

  const handleSaveChart = () => {
    const chart = chartRef.current;
    if (chart && expandedChart) {
      const link = document.createElement('a');
      link.download = `grafico_producao_solar_${expandedChart}.png`;
      link.href = chart.toBase64Image();
      link.click();
    }
  };

  const handleShareClick = () => {
    setShareOptionsVisible(!shareOptionsVisible);
  };

  const shareViaEmail = () => {
    const chart = chartRef.current;
    if (chart && expandedChart) {
      const imageUrl = chart.toBase64Image();
      const subject = 'Gráfico de Produção Solar';
      const body = 'Confira o gráfico de produção de energia solar em anexo.';
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&attachment=${encodeURIComponent(imageUrl.split(',')[1])}`;
      window.open(mailtoLink, '_blank');
      setShareOptionsVisible(false);
    }
  };

  const shareViaWhatsApp = () => {
    const chart = chartRef.current;
    if (chart && expandedChart) {
      const imageUrl = chart.toBase64Image();
      const text = 'Confira o gráfico de produção de energia solar: ' + imageUrl;
      const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappLink, '_blank');
      setShareOptionsVisible(false);
    }
  };

  const shareViaInstagram = () => {
    alert('Compartilhar via Instagram geralmente envolve baixar a imagem e compartilhar manualmente no aplicativo.');
    setShareOptionsVisible(false);
    handleSaveChart();
  };

  const shareViaLinkedIn = () => {
    const chart = chartRef.current;
    if (chart && expandedChart) {
      const imageUrl = chart.toBase64Image();
      const title = 'Gráfico de Produção Solar';
      const summary = 'Confira o gráfico de produção de energia solar.';
      const linkedinLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent(window.location.href)}`;
      window.open(linkedinLink, '_blank');
      setShareOptionsVisible(false);
    }
  };

  const handleSimulationConditionChange = (event) => {
    setSimulationCondition(event.target.value);
  };

  return (
    <div className="home-container">
      <main className="main-content">
        <section className="production-section">
          <h2>Produção Atual</h2>
          <div className="chart-type-selector">
            <label>Tipo de Gráfico:</label>
            <div className="chart-buttons">
              <button
                onClick={() => handleChartTypeChange('line')}
                className={chartType === 'line' ? 'active' : ''}
              >
                Linha
              </button>
              <button
                onClick={() => handleChartTypeChange('bar')}
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
          <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px' }}>
            <div className="chart-container" onClick={() => setExpandedChart(chartType)}>
              {chartType === 'line' && <Line data={productionData} options={productionOptions} ref={chartRef} />}
              {chartType === 'bar' && <Bar data={productionData} options={barChartOptions} ref={chartRef} />}
              {chartType === 'pie' && <Pie data={productionData} options={pieChartOptions} ref={chartRef} />}
            </div>
          </div>
          <div className="analyze-controls" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="simulation-condition" style={{ color: '#fff' }}>Simular Condição:</label>
            <select
              id="simulation-condition"
              value={simulationCondition}
              onChange={handleSimulationConditionChange}
              style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: 'none' }}
            >
              <option value="Ensolarado">Ensolarado</option>
              <option value="Nublado">Nublado</option>
              <option value="Chuvoso">Chuvoso</option>
              <option value="Chuvoso Forte">Chuvoso Forte</option>
              <option value="Sol Muito Quente">Sol Muito Quente</option>
              <option value="Noite">Noite</option>
            </select>
            <button
              className="analyze-button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              style={{ marginTop: '10px' }}
            >
              {isAnalyzing ? 'Simulando...' : 'Simular Produção'}
            </button>
          </div>
        </section>

        <section className="weather-section" style={{ backgroundColor: '#252525', color: '#fff', borderRadius: '8px', padding: '20px' }}>
          <h2>Clima Atual</h2>
          <div className="current-weather">
            <p>Temperatura: {currentWeather.temperature}°C</p>
            <p>Condição: {getWeatherIcon(currentWeather.condition)} {currentWeather.condition}</p>
          </div>

          <h2>Previsão do Tempo</h2>
          <ul className="forecast-list">
            {forecast.map((item, index) => (
              <li key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {item.time} - {getWeatherIcon(item.condition)} {item.condition}
              </li>
            ))}
          </ul>
        </section>
        <br /><br /><br />
      </main>

      {expandedChart && (
        <div className="expanded-chart-overlay" onClick={handleCloseExpandedChart}>
          <div className="expanded-chart-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseExpandedChart} title='Fechar'>
              X
            </button>
            <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 120px)' }}>
              <div className="chart-container">
                {expandedChart === 'line' && <Line data={productionData} options={{ ...productionOptions, responsive: true, maintainAspectRatio: false }} />}
                {expandedChart === 'bar' && <Bar data={productionData} options={{ ...barChartOptions, responsive: true, maintainAspectRatio: false }} />}
                {expandedChart === 'pie' && <Pie data={productionData} options={{ ...pieChartOptions, responsive: true, maintainAspectRatio: false }} />}
              </div>
            </div>
            <div className="expanded-chart-actions">
              <button onClick={handleSaveChart}>Salvar Imagem</button>
              <div className="share-options">
                <a onClick={shareViaEmail}><img src={logoGmail} alt="Email" className='icones' title='Compartilhar por Email' /></a>
                <a onClick={shareViaWhatsApp}><img src={logoWhasapp} alt="WhatsApp" className='icones' title='Compartilhar por WhatsApp' /></a>
                <a onClick={shareViaInstagram}><img src={logoInstagram} alt="Instagram" className='icones' title='Compartilhar por Instagram' /></a>
                <a onClick={shareViaLinkedIn}><img src={logoLinkedin}alt="LinkedIn" className='icones' title='Compartilhar por LinkedIn' /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;