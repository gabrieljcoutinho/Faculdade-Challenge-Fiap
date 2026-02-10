import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../../CSS/Bateria/index.css'
import '../../CSS/Bateria/animacaoPiscar.css';

const Bateria = ({ isDischarging, isCharging, nivelBateria }) => {
  const [piscarCritico, setPiscarCritico] = useState(false);
  const [nivelAnimado, setNivelAnimado] = useState(nivelBateria);
  const notificou50 = useRef(false);
  const animFrame = useRef(null);

  // Solicita permissão de notificação
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Notificação em 50%
  useEffect(() => {
    if (nivelBateria === 50 && !notificou50.current) {
      notificou50.current = true;
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Aviso de Bateria', { body: 'A bateria está em 50%.' });
        } else {
          alert('A bateria está em 50%.');
        }
      }, 100);
    }
  }, [nivelBateria]);

  // Piscar em nível crítico
  useEffect(() => {
    setPiscarCritico(nivelBateria > 0 && nivelBateria < 20);
  }, [nivelBateria]);

  // Animação suave do nível da bateria usando requestAnimationFrame
  useEffect(() => {
    if (animFrame.current) cancelAnimationFrame(animFrame.current);

    const animarNivel = () => {
      setNivelAnimado(prev => {
        if (prev === nivelBateria) return prev;
        const step = (nivelBateria - prev) * 0.1; // suaviza a animação
        const novoNivel = Math.abs(step) < 0.5 ? nivelBateria : prev + step;
        return novoNivel;
      });
      if (nivelAnimado !== nivelBateria) {
        animFrame.current = requestAnimationFrame(animarNivel);
      }
    };

    animFrame.current = requestAnimationFrame(animarNivel);
    return () => cancelAnimationFrame(animFrame.current);
  }, [nivelBateria]);

  // Texto do status da bateria
  const statusText = useMemo(() => {
    if (isCharging) return 'Carregando';
    if (isDischarging) return 'Descarregando';
    return 'Carregado';
  }, [isCharging, isDischarging]);



  // Lógica mudando as cores da bateria
  const corBarra = useMemo(() => {
    if (nivelAnimado >= 50) return '#00fff0';  // azul/ciano
    if (nivelAnimado >= 30) return '#ffff00';  // amarelo
    if (nivelAnimado >= 20) return '#FFA500';  // laranja
    return '#FF0000';                           // vermelho
  }, [nivelAnimado]);




  return (
    <div className={`bateria-container-neon ${piscarCritico ? 'piscar-suave' : ''}`}>
      <h1 className="titulo-bateria">Nível da Bateria</h1>

      <div className="bateria-central">
        <svg className="barra-circular" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="#252525"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke={corBarra}
            strokeWidth="12"
            fill="none"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 * (1 - nivelAnimado / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s ease, stroke-dashoffset 0.3s ease' }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="7"
            fontSize="18px"
            fill={corBarra}
          >
            {nivelAnimado.toFixed(0)}%
          </text>
        </svg>
      </div>

      <p className="texto-nivel-neon">{statusText}</p>
    </div>
  );
};

export default Bateria;
