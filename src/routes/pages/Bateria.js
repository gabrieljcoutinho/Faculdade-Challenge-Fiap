import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../../CSS/Bateria/index.css';

// Importando as imagens da bateria
import bateriaVazia from '../../imgs/imgBateria/bateriaVazia.png';
import bateriaCritica from '../../imgs/imgBateria/nivelCrítico.png';
import semBateria from '../../imgs/imgBateria/semBateria.png';
import acabandoBateria from '../../imgs/imgBateria/acabandoBateria.png';
import bateriaMedia from '../../imgs/imgBateria/bateriaMedia.png';
import bateriaCheia from '../../imgs/imgBateria/bateriaCheia.png';

// Array de imagens agora com um limiar de nível de porcentagem
const imagens = [
  { src: bateriaVazia, alt: 'Bateria Vazia', nivelMinimo: 0 },
  { src: semBateria, alt: 'Sem Bateria', nivelMinimo: 1 },
  { src: bateriaCritica, alt: 'Bateria Crítica', nivelMinimo: 11 },
  { src: acabandoBateria, alt: 'Acabando Bateria', nivelMinimo: 26 },
  { src: bateriaMedia, alt: 'Bateria Média', nivelMinimo: 51 },
  { src: bateriaCheia, alt: 'Bateria Cheia', nivelMinimo: 76 },
];

const Bateria = ({ isDischarging }) => {
  // Agora usamos o estado para o nível da bateria diretamente em porcentagem (0-100)
  const [nivelBateria, setNivelBateria] = useState(100);
  const [fadeState, setFadeState] = useState('fade-in');
  const dischargeIntervalRef = useRef(null);
  const piscarIntervalRef = useRef(null);

  // Efeito principal para controlar o descarregamento
  useEffect(() => {
    // Limpa o intervalo anterior para evitar timers duplicados
    if (dischargeIntervalRef.current) {
      clearInterval(dischargeIntervalRef.current);
    }

    // O descarregamento só acontece se `isDischarging` for verdadeiro
    if (isDischarging) {
      dischargeIntervalRef.current = setInterval(() => {
        setNivelBateria(prevNivel => {
          // Diminui o nível em 1, garantindo que não seja menor que 0
          const newNivel = prevNivel > 0 ? prevNivel - 1 : 0;
          // Se a bateria chegou a 0, limpa o timer
          if (newNivel === 0) {
            clearInterval(dischargeIntervalRef.current);
          }
          return newNivel;
        });
      }, 1000); // Descarrega a cada 1 segundo (1%)
    } else {
      // Se a animação for desligada, reseta a bateria para 100%
      setNivelBateria(100);
    }

    return () => {
      if (dischargeIntervalRef.current) {
        clearInterval(dischargeIntervalRef.current);
      }
    };
  }, [isDischarging]); // O efeito roda sempre que `isDischarging` muda

  // useMemo para selecionar a imagem correta de forma eficiente
  const imagemAtual = useMemo(() => {
    // A imagem é selecionada procurando no array de imagens
    // a que tem o nível mínimo maior que a porcentagem atual da bateria.
    // Usamos 'reverse' e 'find' para encontrar a imagem certa de forma mais limpa.
    return imagens.slice().reverse().find(img => nivelBateria >= img.nivelMinimo) || imagens[0];
  }, [nivelBateria]);

  // Efeito para a animação de piscar quando o nível está baixo
  useEffect(() => {
    if (piscarIntervalRef.current) {
      clearInterval(piscarIntervalRef.current);
    }

    // Ativa o piscar apenas para os níveis mais baixos (0% a 10%)
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
  }, [nivelBateria]); // Roda sempre que o nível da bateria muda

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
        {nivelBateria}% {isDischarging ? 'descarregando' : 'carregado'}
      </p>
    </div>
  );
};

export default Bateria;