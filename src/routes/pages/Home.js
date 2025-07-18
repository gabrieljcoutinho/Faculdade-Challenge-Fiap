import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip } from 'chart.js';
import initialProductionData from '../../data/graficoHomeApi.json';
import { tituloPrincipal, graficos, dados, subTitulo, impacto, economia, descricaoEconomia, arvoresEquivalentes, absorcaoPorArvore, reducaoPoluicao, impactoDescricao } from '../../constants/Home/index.js';
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

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, PieController, ArcElement, BarController, BarElement, Legend, Tooltip);

const COLORS = ['#ADD8E6','#87CEFA','#00BFFF','#1E90FF','rgba(31,81,255,0.7)','#0000FF','#000080'];
const WEATHER_ICONS = {Ensolarado:'☀️',Nublado:'☁️',Chuvoso:'🌧️', 'Parcialmente Nublado':'⛅', Limpo:'🌙'};
const CO2_PER_KWH=0.85, CO2_PER_TREE=22;

const Home = () => {
  const [currentChartType,setCurrentChartType]=useState(()=>localStorage.getItem('preferredChartType')||'line');
  useEffect(()=>localStorage.setItem('preferredChartType',currentChartType),[currentChartType]);
  const [expandedChartType,setExpandedChartType]=useState(null);
  const [chosenDatasetIndex,setChosenDatasetIndex]=useState(0);
  const chartRef=useRef(null);

  useEffect(()=>{
    if(initialProductionData.datasetsOptions?.length) setChosenDatasetIndex(Math.floor(Math.random()*initialProductionData.datasetsOptions.length));
  },[]);

  const productionData=useMemo(()=>{
    if(!initialProductionData.datasetsOptions) return {labels:[],datasets:[]};
    const chosen=initialProductionData.datasetsOptions[chosenDatasetIndex]||initialProductionData.datasetsOptions[0];
    return {labels:initialProductionData.labels,datasets:[{label:chosen.label,data:chosen.data,borderColor:"#0FF0FC",backgroundColor:"rgba(15,240,252,0.3)",fill:true,tension:0.3}]};
  },[chosenDatasetIndex]);

  const totalProduction=useMemo(()=>productionData.datasets[0]?.data.reduce((a,b)=>a+b,0)||0,[productionData]);
  const environmentalImpact=useMemo(()=>{
    const co2Avoided=(totalProduction*CO2_PER_KWH).toFixed(2);
    const equivalentTrees=Math.round(co2Avoided/CO2_PER_TREE);
    return {co2Avoided,equivalentTrees};
  },[totalProduction]);

  const [currentWeather]=useState({temperature:18,condition:'Limpo'});
  const [forecast]=useState([
    {day:'Hoje',condition:'Limpo',high:22,low:12},
    {day:'Amanhã',condition:'Parcialmente Nublado',high:21,low:11},
    {day:'Depois de Amanhã',condition:'Chuvoso',high:18,low:10}
  ]);

  const commonChartOptions=useMemo(()=>({
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{labels:{color:'#fff',font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}},
      tooltip:{backgroundColor:'rgba(0,0,0,0.8)',bodyColor:'#fff',titleColor:'#fff',borderColor:'#fff',borderWidth:1,
        bodyFont:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"},
        titleFont:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}
      }
    },
    scales:{
      x:{title:{display:true,text:'Hora',color:'#fff',font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}},
         ticks:{color:'#fff',font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}},
         grid:{color:'rgba(255,255,255,0.1)'}},
      y:{title:{display:true,text:'Produção (kWh)',color:'#fff',font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}},
         ticks:{color:'#fff',font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}},
         grid:{color:'rgba(255,255,255,0.1)'}}
    }
  }),[]);

  const getChartOptions=useCallback(type=>{
    const baseOpts={...commonChartOptions,onClick:()=>setExpandedChartType(type),plugins:{...commonChartOptions.plugins,title:{
      display:true,color:'#fff',
      text:type==='pie'?'Distribuição da Produção de Energia Solar por Hora':`Produção de Energia Solar por Hora (${type==='line'?'Linha':'Barras'})`,
      font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",size:16}
    }}};
    if(type==='pie'){
      baseOpts.plugins.legend={...baseOpts.plugins.legend,position:'bottom',labels:{...baseOpts.plugins.legend.labels,font:{family:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}};
      baseOpts.plugins.tooltip={...baseOpts.plugins.tooltip,callbacks:{
        label:ctx=>{
          const total=ctx.dataset.data.reduce((a,v)=>a+v,0);
          const perc=Math.round((ctx.raw/total)*100);
          return `${ctx.label}: ${ctx.raw} kWh (${perc}%)`;
        }
      }};
      baseOpts.scales={};
    } else {
      baseOpts.plugins.tooltip={...baseOpts.plugins.tooltip,callbacks:{label:ctx=>`${ctx.dataset.label||''}: ${ctx.parsed.y!==null?ctx.parsed.y+' kWh':''}`}};
    }
    return baseOpts;
  },[commonChartOptions]);

  const getWeatherIcon=useCallback(c=>WEATHER_ICONS[c]||'',[]);

  const shareChart=useCallback(platform=>{
    if(!chartRef.current||!expandedChartType) return alert('Por favor, visualize o gráfico expandido antes de tentar compartilhar.');
    const title='Gráfico de Produção Solar', summary='Confira o gráfico de produção de energia solar gerada pelo nosso sistema. É um passo importante para um futuro mais sustentável!';
    const encodedTitle=encodeURIComponent(title), encodedSummary=encodeURIComponent(summary);
    const link=document.createElement('a');
    link.download=`solar_production_chart_${expandedChartType}.png`;
    link.href=chartRef.current.toBase64Image();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(()=>{
      switch(platform){
        case 'email':
          alert(`A imagem do gráfico foi baixada! Agora, abra seu aplicativo de e-mail e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`);
          window.open(`mailto:?subject=${encodedTitle}&body=${encodedSummary}`,'_blank');
          break;
        case 'whatsapp':
          alert(`A imagem do gráfico foi baixada! Abra o WhatsApp e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`);
          window.open(`https://wa.me/?text=${encodedSummary}`,'_blank');
          break;
        case 'instagram':
          alert(`A imagem do gráfico foi baixada! Abra o Instagram e anexe "solar_production_chart_${expandedChartType}.png".`);
          break;
        case 'linkedin':
          alert(`A imagem do gráfico foi baixada! Abra o LinkedIn e anexe "solar_production_chart_${expandedChartType}.png".\n\n${decodeURIComponent(encodedSummary)}`);
          break;
        default:
          alert('A imagem do gráfico foi baixada! Compartilhe manualmente na plataforma desejada.');
          break;
      }
    },500);
  },[expandedChartType]);

  const getChartData=useCallback(type=>{
    if(!productionData.datasets?.length) return {labels:[],datasets:[]};
    const base=productionData.datasets[0], common={label:base.label,data:base.data,borderColor:"#1E90FF",borderWidth:1};
    if(type==='line') return {labels:productionData.labels,datasets:[{...common,backgroundColor:"rgba(30,144,255,0.2)",fill:true,tension:0.3}]};
    if(type==='bar') return {labels:productionData.labels,datasets:[{...common,backgroundColor:COLORS}]};
    if(type==='pie'){
      const lLabels=productionData.labels.slice(0,7), lData=base.data.slice(0,7);
      return {labels:lLabels,datasets:[{...common,data:lData,backgroundColor:COLORS.slice(0,lLabels.length)}]};
    }
    return productionData;
  },[productionData]);

  const ChartComponent=useMemo(()=>({line:Line,bar:Bar,pie:Pie})[currentChartType],[currentChartType]);
  const ExpandedChartComponent=useMemo(()=>({line:Line,bar:Bar,pie:Pie})[expandedChartType],[expandedChartType]);

  return (
    <div className="home-container">
      <main className="main-content">
        <section className="production-section">
          <h2 className='tituloPrincipalHome'>{tituloPrincipal}</h2>
          <div className="chart-type-selector">
            <label className='tipoGrafico'>{graficos}</label>
            <div className="chart-buttons" title='Grafico'>
              {['line','bar','pie'].map(t=>(
                <button key={t} onClick={()=>setCurrentChartType(t)} className={currentChartType===t?'active':''}>
                  {t==='line'?'Linha':t==='bar'?'Barra':'Pizza'}
                </button>
              ))}
            </div>
          </div>
          <div style={{backgroundColor:'#252525',borderRadius:'8px',padding:'15px'}}>
            <div className="chart-container" onClick={()=>setExpandedChartType(currentChartType)}>
              {ChartComponent && <ChartComponent data={getChartData(currentChartType)} options={getChartOptions(currentChartType)} ref={chartRef} />}
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
            {forecast.map((item,i)=>(
              <div key={i} className="weather-card forecast-card">
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
        <br/><br/><br/><br/><br/>
      </main>
      {expandedChartType && (
        <div className="expanded-chart-overlay" onClick={()=>setExpandedChartType(null)}>
          <div className="expanded-chart-container" onClick={e=>e.stopPropagation()}>
            <button className="close-button" onClick={()=>setExpandedChartType(null)} title="Fechar">X</button>
            <div style={{backgroundColor:'#252525',borderRadius:'8px',padding:'15px',height:'calc(100% - 170px)',overflowY:'auto'}}>
              <div className="chart-container">
                {ExpandedChartComponent && <ExpandedChartComponent data={getChartData(expandedChartType)} options={getChartOptions(expandedChartType)} />}
              </div>
              <h3 style={{color:'#fff',marginTop:'20px',textAlign:'center',fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}} title="Dados de Produção">Dados de Produção</h3>
              <div className="data-table-container">
                <table style={{width:'100%',borderCollapse:'collapse',color:'#fff'}}>
                  <thead><tr style={{borderBottom:'1px solid #fff'}}><th style={{padding:'8px',textAlign:'left',fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>Hora</th><th style={{padding:'8px',textAlign:'left',fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>Produção (kWh)</th></tr></thead>
                  <tbody>
                    {productionData.labels?.map((l,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                        <td style={{padding:'8px',fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>{l}</td>
                        <td style={{padding:'8px',fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>{productionData.datasets?.[0]?.data[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="expanded-chart-actions">
              <button onClick={()=>{
                if(chartRef.current && expandedChartType){
                  const l=document.createElement('a');
                  l.download=`solar_production_chart_${expandedChartType}.png`;
                  l.href=chartRef.current.toBase64Image();
                  document.body.appendChild(l);
                  l.click();
                  document.body.removeChild(l);
                  alert(`A imagem "solar_production_chart_${expandedChartType}.png" foi salva em seu dispositivo!`);
                }
              }}>Salvar Imagem</button>
              <div className="share-options">
                <a href="#!" onClick={()=>shareChart('email')} title="Compartilhar por Email"><img src={logoGmail} alt="Email" className="icones"/></a>
                <a href="#!" onClick={()=>shareChart('whatsapp')} title="Compartilhar no WhatsApp"><img src={logoWhatsapp} alt="WhatsApp" className="icones"/></a>
                <a href="#!" onClick={()=>shareChart('instagram')} title="Compartilhar no Instagram"><img src={logoInstagram} alt="Instagram" className="icones"/></a>
                <a href="#!" onClick={()=>shareChart('linkedin')} title="Compartilhar no LinkedIn"><img src={logoLinkedin} alt="LinkedIn" className="icones"/></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
