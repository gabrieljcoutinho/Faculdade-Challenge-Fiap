import React, { useState } from 'react';
import '../../CSS/EsqueciSenha/resetJs.module.css';
import '../../CSS/EsqueciSenha/layout.module.css';
import '../../CSS/EsqueciSenha/form.module.css';
import '../../CSS/EsqueciSenha/button.module.css';
import '../../CSS/EsqueciSenha/animations.module.css';
import '../../CSS/EsqueciSenha/messagens.css';
import '../../CSS/EsqueciSenha/links.css';
import '../../CSS/EsqueciSenha/mediaScreen.css';

import { tituloPrincipal, paragrafoEsqueciSenha, Email, btnRecuperarSenha, voltarPaginaLogin } from '../../constants/EsqueciSenha/index.js'

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email) return setError('Por favor, insira seu endereço de e-mail.');

    console.log(`Enviando solicitação de redefinição de senha para: ${email}`);

    setTimeout(() => {
      setMessage(email === 'test@exemplo.com'
        ? 'Se existir uma conta com esse e-mail, enviamos um link para redefinição de senha.!'
        : 'Sua senha foi enviada para esse email');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className='tituloEsqueciSenha'>{tituloPrincipal}</h2>
        <p className='paragrafoEsqueciSenha'>{paragrafoEsqueciSenha}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className='labelEmail'>{Email}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="SeuEmail@gmail.com"
              required
              className='iputEmail'
            />
          </div>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="reset-button">{btnRecuperarSenha}</button>
        </form>
        <div className="back-to-login">
          <a href="/login">{voltarPaginaLogin}</a>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
