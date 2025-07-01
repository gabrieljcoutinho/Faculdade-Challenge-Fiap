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
  {
    question: "É possível agendar o funcionamento de um aparelho?",
    answer: "Sim. Acesse a aba de agendamentos, selecione o aparelho e defina o horário desejado.",
  },
  {
    question: "O sistema funciona offline?",
    answer: "Algumas funções básicas funcionam offline, mas o controle remoto e as atualizações exigem conexão com a internet.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim, todos os dados são criptografados e protegidos conforme a LGPD. Nenhuma informação é compartilhada sem autorização.",
  },
  {
    question: "Como redefinir minha senha?",
    answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para seu e-mail.",
  },
  {
    question: "Posso personalizar os nomes dos aparelhos?",
    answer: "Sim, ao clicar em um dispositivo na aba de conexões, você pode editar seu nome e ícone.",
  },
  {
    question: "Como recebo alertas ou notificações?",
    answer: "Você será notificado por alertas visuais e sonoros no sistema, além de notificações push se estiver ativado.",
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
      <h1 className='perguntasFrequentes'>Perguntas Frequentes</h1>
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
