// src/routes/pages/PerguntasFrequentes.js
import React, { useState } from 'react';
import '../../CSS/PerguntasFrequentes/perguntasFrequentes.module.css';
import '../../CSS/PerguntasFrequentes/btnPerguntasFrequentes.css';

const PerguntasFrequentes = ({ isReading }) => {
  const [openIndex, setOpenIndex] = useState(null);

  // Directly define FAQ data within the component
  const faqs = [
    { question: "Qual é o horário de funcionamento?", answer: "Atendemos de segunda a sexta, das 9h às 18h." },
    { question: "Vocês fazem entregas?", answer: "Sim, realizamos entregas em todo o território nacional." },
    { question: "Quais formas de pagamento são aceitas?", answer: "Aceitamos cartões de crédito, débito, boleto bancário e PIX." },
    { question: "Como faço para trocar um produto?", answer: "Você pode solicitar a troca em até 30 dias após o recebimento, seguindo nossa política de trocas." },
    { question: "Existe garantia para os produtos?", answer: "Todos os nossos produtos possuem garantia de 90 dias contra defeitos de fabricação." },
    { question: "Como posso entrar em contato com o suporte?", answer: "Você pode nos contatar por telefone, e-mail ou chat online, disponíveis em nosso site." },
    { question: "É possível rastrear meu pedido?", answer: "Sim, após o envio, você receberá um código de rastreamento por e-mail." },
    { question: "Vocês oferecem descontos para compras em grande volume?", answer: "Sim, entre em contato para mais informações sobre nossos preços especiais para atacado." },
    { question: "Posso retirar o produto na loja física?", answer: "No momento, operamos apenas online, sem loja física para retirada." },
    { question: "Como funciona a política de privacidade?", answer: "Nossa política de privacidade detalha como coletamos, usamos e protegemos seus dados. Você pode consultá-la em nosso site." },
    { question: "Vocês vendem para empresas?", answer: "Sim, emitimos nota fiscal para empresas e oferecemos condições especiais." },
    { question: "Como faço para cancelar um pedido?", answer: "O cancelamento pode ser solicitado antes do envio. Após o envio, siga a política de devolução." }
  ];

  const tituloPrincipal = "Perguntas Frequentes"; // Define the title directly

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      window.speechSynthesis.cancel();
      setOpenIndex(null);
    } else {
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