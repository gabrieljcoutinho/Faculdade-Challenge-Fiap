import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Login/login.css';

const Logar = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/'); // Simulate successful auth
  };

  return (
    <main className="login-container">
      <section className="login-box">
        <h1>Acesse sua conta</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" placeholder="Seu e-mail" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div className="password-input-group">
              <input
                type={showPass ? 'text' : 'password'}
                id="password"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">Entrar</button>
        </form>
        <div className="links">
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
          <p>Não tem conta? <Link to="/cadastro">Crie uma agora</Link></p>
        </div>
      </section>
      <aside className="login-info">
        <h2>Por que se juntar a nós?</h2>
        <ul>
          {['✨', '💾', '🔔', '⚙️'].map((icon, i) => (
            <li key={i}>
              <span aria-hidden="true">{icon}</span> {[
                'Descubra um mundo de recursos exclusivos',
                'Salve seu progresso e continue de onde parou',
                'Receba atualizações importantes e novidades',
                'Personalize sua experiência ao seu gosto'
              ][i]}
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
};

export default Logar;