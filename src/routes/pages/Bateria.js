import React, { useState, useEffect, useRef } from 'react';
import '../../CSS/Bateria/index.css';

import bateriaVazia from '../../imgs/imgBateria/bateriaVazia.png';
import bateriaCritica from '../../imgs/imgBateria/nivelCrítico.png';
import semBateria from '../../imgs/imgBateria/semBateria.png';
import acabandoBateria from '../../imgs/imgBateria/acabandoBateria.png';
import bateriaMedia from '../../imgs/imgBateria/bateriaMedia.png';
import bateriaCheia from '../../imgs/imgBateria/bateriaCheia.png';

const imagens = [
  { src: bateriaVazia, alt: 'Bateria Vazia', nivel: 0 },
  { src: semBateria, alt: 'Sem Bateria', nivel: 10 },
  { src: bateriaCritica, alt: 'Bateria Crítica', nivel: 25 },
  { src: acabandoBateria, alt: 'Acabando Bateria', nivel: 50 },
  { src: bateriaMedia, alt: 'Bateria Média', nivel: 75 },
  { src: bateriaCheia, alt: 'Bateria Cheia', nivel: 100 },
];

const Bateria = () => {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');
  const piscarInterval = useRef(null);
  const trocaTimeout = useRef(null);

  useEffect(() => {
    clearInterval(piscarInterval.current);
    clearTimeout(trocaTimeout.current);

    if (indiceAtual === 0 || indiceAtual === 1) {
      piscarInterval.current = setInterval(() => {
        setFadeState(state => (state === 'fade-in' ? 'fade-piscar' : 'fade-in'));
      }, 800);
    } else {
      setFadeState('fade-in');
    }

    trocaTimeout.current = setTimeout(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setIndiceAtual(i => (i < imagens.length - 1 ? i + 1 : i));
        setFadeState('fade-in');
      }, 800);
    }, 10000);

    return () => {
      clearInterval(piscarInterval.current);
      clearTimeout(trocaTimeout.current);
    };
  }, [indiceAtual]);

  const nivelBateria = imagens[indiceAtual].nivel;

  return (
    <div className="bateria-container">
      <h1 className="titulo-bateria">Nível da Bateria</h1>

      <div className={`imagem-bateria ${fadeState}`}>
        <img
          src={imagens[indiceAtual].src}
          alt={imagens[indiceAtual].alt}
          key={indiceAtual}
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

      <p className="texto-nivel">{nivelBateria}% carregado</p>
    </div>
  );
};

export default Bateria;
