import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../../CSS/Bateria/index.css';

// Importando as imagens da bateria
import bateriaVazia from '../../imgs/imgBateria/bateriaVazia.png';
import bateriaCritica from '../../imgs/imgBateria/nivelCrítico.png';
import semBateria from '../../imgs/imgBateria/semBateria.png';
import acabandoBateria from '../../imgs/imgBateria/acabandoBateria.png';
import bateriaMedia from '../../imgs/imgBateria/bateriaMedia.png';
import bateriaCheia from '../../imgs/imgBateria/bateriaCheia.png';

const imagens = [
  { src: bateriaVazia, alt: 'Bateria Vazia', nivelMinimo: 0 },
  { src: semBateria, alt: 'Sem Bateria', nivelMinimo: 1 },
  { src: bateriaCritica, alt: 'Bateria Crítica', nivelMinimo: 11 },
  { src: acabandoBateria, alt: 'Acabando Bateria', nivelMinimo: 26 },
  { src: bateriaMedia, alt: 'Bateria Média', nivelMinimo: 51 },
  { src: bateriaCheia, alt: 'Bateria Cheia', nivelMinimo: 76 },
];

const Bateria = ({ isDischarging, isCharging }) => {
  const [nivelBateria, setNivelBateria] = useState(100);
  const [fadeState, setFadeState] = useState('fade-in');
  const batteryIntervalRef = useRef(null);
  const piscarIntervalRef = useRef(null);

  useEffect(() => {
    if (batteryIntervalRef.current) {
      clearInterval(batteryIntervalRef.current);
    }

    // A lógica de descarregamento tem prioridade
    if (isDischarging) {
      batteryIntervalRef.current = setInterval(() => {
        setNivelBateria(prevNivel => {
          const newNivel = prevNivel > 0 ? prevNivel - 1 : 0;
          if (newNivel === 0) {
            clearInterval(batteryIntervalRef.current);
          }
          return newNivel;
        });
      }, 1000);
    } else if (isCharging) {
      // Se não estiver descarregando, verificamos se está carregando
      batteryIntervalRef.current = setInterval(() => {
        setNivelBateria(prevNivel => {
          const newNivel = prevNivel < 100 ? prevNivel + 1 : 100;
          if (newNivel === 100) {
            clearInterval(batteryIntervalRef.current);
          }
          return newNivel;
        });
      }, 1000);
    } else {
        // Se a bateria não estiver carregando nem descarregando
        // e o nível estiver em 100%, paramos qualquer timer ativo.
        // Se não estiver em 100%, o timer para automaticamente.
        setNivelBateria(prevNivel => prevNivel);
    }

    return () => {
      if (batteryIntervalRef.current) {
        clearInterval(batteryIntervalRef.current);
      }
    };
  }, [isDischarging, isCharging]);

  const imagemAtual = useMemo(() => {
    return imagens.slice().reverse().find(img => nivelBateria >= img.nivelMinimo) || imagens[0];
  }, [nivelBateria]);

  useEffect(() => {
    if (piscarIntervalRef.current) {
      clearInterval(piscarIntervalRef.current);
    }

    if (nivelBateria <= 10 && nivelBateria > 0) {
      piscarIntervalRef.current = setInterval(() => {
        setFadeState(state => (state === 'fade-in' ? 'fade-piscar' : 'fade-in'));
      }, 800);
    } else {
      setFadeState('fade-in');
    }

    return () => {
      if (piscarIntervalRef.current) {
        clearInterval(piscarIntervalRef.current);
      }
    };
  }, [nivelBateria]);

  const statusText = useMemo(() => {
    if (isCharging) {
      return 'carregando';
    } else if (isDischarging) {
      return 'descarregando';
    } else {
      return 'carregado';
    }
  }, [isCharging, isDischarging]);

  return (
    <div className="bateria-container">
      <h1 className="titulo-bateria">Nível da Bateria</h1>

      <div className={`imagem-bateria ${fadeState}`}>
        <img
          src={imagemAtual.src}
          alt={imagemAtual.alt}
          draggable={false}
          loading="lazy"
        />
      </div>

      <div
        className="barra-progresso"
        role="progressbar"
        aria-valuenow={nivelBateria}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="barra-preenchida"
          style={{ width: `${nivelBateria}%` }}
          aria-label={`Nível da bateria: ${nivelBateria}%`}
        />
      </div>

      <p className="texto-nivel">
        {nivelBateria}% {statusText}
      </p>
    </div>
  );
};

export default Bateria;