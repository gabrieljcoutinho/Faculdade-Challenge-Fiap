import React from 'react';
import '../CSS/HelpCenter/index.css'; // Estilo separado

const categorias = [
  {
    titulo: 'Conta',
    descricao: 'Gerencie suas informações pessoais, senha e segurança.',
    icone: (
      <svg viewBox="0 0 24 24" title='Ícone de Conta'>
        <path d="M12 2L2 7h20L12 2zM2 9v11h20V9H2zm5 2h10v2H7v-2z" />
      </svg>
    ),
  },
  {
    titulo: 'Problemas Técnicos',
    descricao: 'Solucione erros de login, travamentos ou bugs.',
    icone: (
      <svg viewBox="0 0 24 24" title='Ícone de Problemas Técnicos'>
        <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm1 11h-2v-2h2v2zm0-4h-2V7h2v4z" />
      </svg>
    ),
  },
  {
    titulo: 'Pagamentos',
    descricao: 'Informações sobre cobranças, reembolsos e faturas.',
    icone: (
      <svg viewBox="0 0 24 24" title="Ícone de Pagamento" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" ry="2" stroke="#007bff" strokeWidth="2" fill="none" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="#007bff" strokeWidth="2" />
        <line x1="7" y1="16" x2="10" y2="16" stroke="#007bff" strokeWidth="2" />
      </svg>
    ),
  },
  {
    titulo: 'Segurança',
    descricao: 'Dicas para manter sua conta protegida e segura.',
    icone: (
      <svg viewBox="0 0 24 24" title="Ícone de Segurança">
        <path d="M12 22s8-4.5 8-10V5l-8-3-8 3v7c0 5.5 8 10 8 10z" />
      </svg>
    ),
  },
  {
    titulo: 'Notificações',
    descricao: 'Gerencie preferências de e-mail e push.',
    icone: (
      <svg viewBox="0 0 24 24" title="Ícone de Notificações">
        <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5a6 6 0 00-12 0v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
  {
    titulo: 'Privacidade',
    descricao: 'Controle o uso dos seus dados pessoais.',
    icone: (
      <svg viewBox="0 0 24 24" title="Ícone de Privacidade">
        <path d="M12 1l8 4v6c0 5.25-3.5 10-8 12-4.5-2-8-6.75-8-12V5l8-4z" />
      </svg>
    ),
  },
  {
    titulo: 'Atualizações',
    descricao: 'Saiba mais sobre as últimas novidades e mudanças.',
    icone: (
      <svg viewBox="0 0 24 24" title="Ícone de Atualizações">
        <path d="M17.65 6.35A8 8 0 104 12h2a6 6 0 111.76 4.24L5 15v5h5l-1.59-1.59A8 8 0 0017.65 6.35z" />
      </svg>
    ),
  },
];

const HelpCenter = () => {
  return (
    <div className="container">
      <h2 className="tituloHelpCenter">Categorias de Suporte</h2>
      <br /><br />
      <div className="categories">
        {categorias.map((cat, index) => (
          <div className="category" key={index}>
            {cat.icone}
            <h4>{cat.titulo}</h4>
            <p>{cat.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenter;
