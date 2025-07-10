// src/routes/pages/PerguntasFrequentes.js
import React, { useState } from 'react';
import '../../CSS/PerguntasFrequentes/perguntasFrequentes.css';
import '../../CSS/PerguntasFrequentes/btnPerguntasFrequentes.css';

//Variaveis
import {tituloPrincipal, perguntasFrequentes1, perguntasFrequentes1Resposta,
   perguntasFrequentes2, perguntasFrequentes2Resposta, perguntasFrequentes3,
perguntasFrequentes3Resposta, perguntasFrequentes4, perguntasFrequentes4Resposta,
  perguntasFrequentes5, perguntasFrequentes5Resposta, perguntasFrequentes6,
  perguntasFrequentes6Resposta, perguntasFrequentes7, perguntasFrequentes7Resposta,
  perguntasFrequentes8, perguntasFrequentes8Resposta, perguntasFrequentes9,
  perguntasFrequentes9Resposta, perguntasFrequentes10, perguntasFrequentes10Resposta,
  perguntasFrequentes11, perguntasFrequentes11Resposta, perguntasFrequentes12,
  perguntasFrequentes12Resposta
} from '../../constants/PerguntasFrequentes/index.js';

const faqs = [
  {
    question: perguntasFrequentes1,
    answer: perguntasFrequentes1Resposta,
  },
  {
    question: perguntasFrequentes2,
    answer: perguntasFrequentes2Resposta,
  },
  {
    question: perguntasFrequentes3,
    answer: perguntasFrequentes3Resposta,
  },
  {
    question: perguntasFrequentes4,
    answer: perguntasFrequentes4Resposta,
  },
  {
    question: perguntasFrequentes5,
    answer: perguntasFrequentes5Resposta,
  },
  {
    question: perguntasFrequentes6,
    answer: perguntasFrequentes6Resposta,
  },
  {
    question: perguntasFrequentes7,
    answer: perguntasFrequentes7Resposta,
  },
  {
    question: perguntasFrequentes8,
    answer: perguntasFrequentes8Resposta,
  },
  {
    question: perguntasFrequentes9,
    answer: perguntasFrequentes9Resposta,
  },
  {
    question: perguntasFrequentes10,
    answer: perguntasFrequentes10Resposta,
  },
  {
    question: perguntasFrequentes11,
    answer: perguntasFrequentes11Resposta,
  },
  {
    question: perguntasFrequentes12,
    answer: perguntasFrequentes12Resposta,
  },
];

const PerguntasFrequentes = ({ isReading }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      // Fecha a pergunta e cancela a leitura
      window.speechSynthesis.cancel();
      setOpenIndex(null);
    } else {
      // Abre a pergunta e lê somente a resposta se leitura estiver ativada
      setOpenIndex(index);

      if (isReading) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(faqs[index].answer);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="perguntas-frequentes-container">
      <h1 className='perguntasFrequentes'>{tituloPrincipal}</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleFAQ(index)}
            aria-expanded={openIndex === index}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') toggleFAQ(index); }}
          >
            <h3 className="faq-question">
              {faq.question}
              <span className="faq-icon">{openIndex === index ? '-' : '+'}</span>
            </h3>
            {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerguntasFrequentes;
