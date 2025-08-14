import React, { useState, useEffect, useRef, useMemo } from 'react';

import '../../CSS/Bateria/animacaoPiscar.css'

const Bateria = ({ isDischarging, isCharging, nivelBateria }) => {
  const [piscarCritico, setPiscarCritico] = useState(false);
  const [nivelAnimado, setNivelAnimado] = useState(nivelBateria);
  const notificou50 = useRef(false);

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
    setPiscarCritico(nivelBateria <= 20 && nivelBateria > 0);
  }, [nivelBateria]);

  // Animação suave do nível da bateria
  useEffect(() => {
    const diff = nivelBateria - nivelAnimado;
    if (diff === 0) return;

    const step = diff > 0 ? 1 : -1;
    const interval = setInterval(() => {
      setNivelAnimado(prev => {
        const novo = prev + step;
        if ((step > 0 && novo >= nivelBateria) || (step < 0 && novo <= nivelBateria)) {
          clearInterval(interval);
          return nivelBateria;
        }
        return novo;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [nivelBateria]);

  const statusText = useMemo(() => {
    if (isCharging) return 'Carregando';
    if (isDischarging) return 'Descarregando';
    return 'Carregado';
  }, [isCharging, isDischarging]);

  const corBarra = nivelAnimado >= 50 ? '#00fff0' : nivelAnimado >= 20 ? '#ffff00' : '#FF0000';

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
            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
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
