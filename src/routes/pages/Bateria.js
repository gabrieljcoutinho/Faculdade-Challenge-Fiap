import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../../CSS/Bateria/index.css';

import bateriaVazia from '../../imgs/imgBateria/bateriaVazia.png';
import bateriaCritica from '../../imgs/imgBateria/nivelCrítico.png';
import semBateria from '../../imgs/imgBateria/semBateria.png';
import acabandoBateria from '../../imgs/imgBateria/acabandoBateria.png';
import bateriaMedia from '../../imgs/imgBateria/bateriaMedia.png';
import bateriaCheia from '../../imgs/imgBateria/bateriaCheia.png';

// Mapeamento de imagens
const MAPA_BATERIA = [
  { src: bateriaVazia, alt: 'Bateria Vazia', nivelMinimo: 0 },
  { src: semBateria, alt: 'Sem Bateria', nivelMinimo: 1 },
  { src: bateriaCritica, alt: 'Bateria Crítica', nivelMinimo: 11 },
  { src: acabandoBateria, alt: 'Acabando Bateria', nivelMinimo: 26 },
  { src: bateriaMedia, alt: 'Bateria Média', nivelMinimo: 51 },
  { src: bateriaCheia, alt: 'Bateria Cheia', nivelMinimo: 76 },
];

// Função para obter imagem baseada no nível
const getImagemBateria = (nivel) =>
  [...MAPA_BATERIA].reverse().find(img => nivel >= img.nivelMinimo) || MAPA_BATERIA[0];

const Bateria = ({ isDischarging, isCharging, nivelBateria }) => {
  const [piscar, setPiscar] = useState(false);
  const notificou50 = useRef(false);

  // Pede permissão de notificação uma vez
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Notificação ao atingir 50%
  useEffect(() => {
    if (nivelBateria === 50 && !notificou50.current) {
      notificou50.current = true;
      if (Notification.permission === "granted") {
        new Notification("Aviso de Bateria", {
          body: "A bateria está em 50%.",
          icon: bateriaMedia
        });
      } else {
        alert("A bateria está em 50%.");
      }
    }
  }, [nivelBateria]);

  // Ativa/desativa piscada
  useEffect(() => {
    setPiscar(nivelBateria <= 10 && nivelBateria > 0);
  }, [nivelBateria]);

  const imagemAtual = useMemo(() => getImagemBateria(nivelBateria), [nivelBateria]);

  const statusText = useMemo(() => {
    if (isCharging) return 'carregando';
    if (isDischarging) return 'descarregando';
    return 'carregado';
  }, [isCharging, isDischarging]);

  return (
    <div className="bateria-container" aria-live="polite">
      <h1 className="titulo-bateria">Nível da Bateria</h1>

      <div className={`imagem-bateria ${piscar ? 'piscar' : ''}`}>
        <img src={imagemAtual.src} alt={imagemAtual.alt} draggable={false} loading="lazy" />
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
          aria-label={`Nível da bateria: ${nivelBateria.toFixed(0)}%`}
        />
      </div>

      <p className="texto-nivel">
        {nivelBateria.toFixed(0)}% {statusText}
      </p>
    </div>
  );
};

export default Bateria;
