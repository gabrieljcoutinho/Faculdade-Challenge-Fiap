import React from 'react';
import '../../CSS/HelpCenter/container.css';
import '../../CSS/HelpCenter/categories.css';
import '../../CSS/HelpCenter/categoryCard.css';
import '../../CSS/HelpCenter/titulo.css'; // Assuming this is still needed for .tituloHelpCenter

import { tituloPrincipal, conta, descricaoConta, problemas, descricaoProblemas,
  pagamentos, descricaoPagamentos, seguranca, descricaoSeguranca, notificacoes,
descricaoNotificacoes, privacidade, descricaoPrivacidade, atualizacoes,
descricaoAtualizacoes} from '../../constants/Help Center/index.js';

const categorias = [
  { titulo: conta, descricao: descricaoConta, icone: (<svg viewBox="0 0 24 24" title='Ícone de Conta'><path d="M12 2L2 7h20L12 2zM2 9v11h20V9H2zm5 2h10v2H7v-2z" /></svg>) },
  { titulo: problemas, descricao: descricaoProblemas, icone: (<svg viewBox="0 0 24 24" title='Ícone de Problemas Técnicos'><path d="M12 4a8 8 0 100 16 8 8 0 000-16zm1 11h-2v-2h2v2zm0-4h-2V7h2v4z" /></svg>) },
  { titulo: pagamentos, descricao: descricaoPagamentos, icone: (<svg viewBox="0 0 24 24" title="Ícone de Pagamento" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" ry="2" stroke="#007bff" strokeWidth="2" fill="none" /><line x1="3" y1="10" x2="21" y2="10" stroke="#007bff" strokeWidth="2" /><line x1="7" y1="16" x2="10" y2="16" stroke="#007bff" strokeWidth="2" /></svg>) },
  { titulo: seguranca, descricao: descricaoSeguranca, icone: (<svg viewBox="0 0 24 24" title="Ícone de Segurança"><path d="M12 22s8-4.5 8-10V5l-8-3-8 3v7c0 5.5 8 10 8 10z" /></svg>) },
  { titulo: notificacoes, descricao: descricaoNotificacoes, icone: (<svg viewBox="0 0 24 24" title="Ícone de Notificações"><path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5a6 6 0 00-12 0v5l-2 2v1h16v-1l-2-2z" /></svg>) },
  { titulo: privacidade, descricao: descricaoPrivacidade, icone: (<svg viewBox="0 0 24 24" title="Ícone de Privacidade"><path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H9V7a3 3 0 013-3zm-1 9h2v4h-2v-4z" /></svg>) },
  { titulo: atualizacoes, descricao: descricaoAtualizacoes, icone: (<svg viewBox="0 0 24 24" title="Ícone de Atualizações"><path d="M17.65 6.35A8 8 0 104 12h2a6 6 0 111.76 4.24L5 15v5h5l-1.59-1.59A8 8 0 0017.65 6.35z" /></svg>) },
];

const HelpCenter = () => (
  <div className="container">
    <h2 className="tituloHelpCenter">{tituloPrincipal}</h2>
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

export default HelpCenter;