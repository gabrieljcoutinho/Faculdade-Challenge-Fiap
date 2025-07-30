// src/routes/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '4rem', color: '#ff5555' }}>404</h1>
      <p style={{ fontSize: '1.5rem' }}>Página não encontrada.</p>
      <Link to="/" style={{ color: '#0FF0FC', textDecoration: 'underline' }}>
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;
