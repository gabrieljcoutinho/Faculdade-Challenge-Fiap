import React, { useState, useEffect, useRef } from 'react';

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

  const generateRandomData = () => {
    const type = Math.floor(Math.random() * 4); // 0 a 3
    const base = [5, 10, 15, 20, 25, 20, 10];

    switch (type) {
      case 0:
        return base.map((v) => v + Math.floor(Math.random() * 3 - 1));
      case 1:
        return base.map((_, i) => Math.round(15 + 10 * Math.sin(i)));
      case 2:
        return Array.from({ length: 7 }, () => Math.floor(Math.random() * 35));
      case 3:
        return [5, 12, 25, 35, 28, 18, 10].map((v) => v + Math.floor(Math.random() * 4 - 2));
      default:
        return base;
    }
  };

  const handleAnalyzeClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
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
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleCloseExpandedChart = () => {
    setExpandedChart(null);
    setShareOptionsVisible(false);
  };

  useEffect(() => {
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
  }, []);

  const currentWeather = {
    temperature: 28,
    condition: 'Ensolarado',
  };

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
    handleSaveChart(); // Suggest saving for manual sharing
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
          <button
            className="analyze-button"
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            style={{ marginTop: '35px' }}
          >
            {isAnalyzing ? 'Analisando...' : 'Atualizar Produção'}
          </button>
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
            <button className="close-button" onClick={handleCloseExpandedChart} title="Fechar">
              X
            </button>
            <div style={{ backgroundColor: '#252525', borderRadius: '8px', padding: '15px', height: 'calc(100% - 170px)', overflowY: 'auto' }}>
              <div className="chart-container">
                {expandedChart === 'line' && <Line data={productionData} options={{ ...productionOptions, responsive: true, maintainAspectRatio: false }} />}
                {expandedChart === 'bar' && <Bar data={productionData} options={{ ...barChartOptions, responsive: true, maintainAspectRatio: false }} />}
                {expandedChart === 'pie' && <Pie data={productionData} options={{ ...pieChartOptions, responsive: true, maintainAspectRatio: false }} />}
              </div>

              <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'center' }}>Dados de Produção</h3>
              <div className="data-table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #fff' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Hora</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Produção (kWh)</th>
                    </tr>
                  </thead>
                  <tbody>
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
            <div className="expanded-chart-actions">
              <button onClick={handleSaveChart}>Salvar Imagem</button>
              <div className="share-options">
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