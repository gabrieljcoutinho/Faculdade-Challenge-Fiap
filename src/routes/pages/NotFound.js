// src/routes/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../CSS/NotFound/index.css'; // Importe o novo arquivo CSS

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-text">Página não encontrada.</p>
      <Link to="/" className="notfound-link">
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default NotFound;
