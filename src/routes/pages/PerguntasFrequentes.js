// src/routes/pages/PerguntasFrequentes.js
import React, { useState } from 'react';
import '../../CSS/PerguntasFrequentes/perguntasFrequentes.css';
import '../../CSS/PerguntasFrequentes/btnPerguntasFrequentes.css';

const faqs = [
  {
    question: "Como conectar um aparelho ao sistema?",
    answer: "Você pode conectar aparelhos via Bluetooth, QR Code ou manualmente na seção de conexões.",
  },
  {
    question: "Quais aparelhos são compatíveis?",
    answer: "TV, Ar-condicionado, Lâmpadas, Fritadeira Airfry, Carregadores, e outros que suportem conexão Bluetooth.",
  },
  {
    question: "Como faço para remover um aparelho?",
    answer: "Na página de conexões, você pode remover aparelhos que não usa mais clicando no ícone de lixeira.",
  },
  {
    question: "É possível controlar aparelhos remotamente?",
    answer: "Sim, desde que estejam conectados ao sistema via Bluetooth ou rede Wi-Fi e estejam configurados corretamente.",
  },
  {
    question: "Como atualizar o sistema?",
    answer: "As atualizações são feitas automaticamente quando seu dispositivo está conectado à internet.",
  },
  {
    question: "Posso usar o sistema em vários dispositivos ao mesmo tempo?",
    answer: "Sim, o sistema permite o acesso simultâneo em diferentes aparelhos, como celular e tablet.",
  },
];

const PerguntasFrequentes = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="perguntas-frequentes-container">
      <h1>Perguntas Frequentes</h1>
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
