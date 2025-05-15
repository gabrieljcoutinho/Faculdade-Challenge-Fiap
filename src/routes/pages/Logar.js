import React, { useState } from 'react';
import '../../CSS/Login/login.css';
import { Link, useNavigate } from 'react-router-dom';

const Logar = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aqui você colocaria sua lógica de autenticação
    // Por exemplo, verificar se o e-mail e a senha estão corretos

    // Simulando uma autenticação bem-sucedida
    const autenticado = true;

    if (autenticado) {
      navigate('/'); // Redireciona para a página Home
    } else {
      // Aqui você pode adicionar lógica para exibir mensagens de erro
      alert('Falha na autenticação. Verifique seu e-mail e senha.');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
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
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
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
          <li><span aria-hidden="true">✨</span> Descubra um mundo de recursos exclusivos.</li>
          <li><span aria-hidden="true">💾</span> Salve seu progresso e continue de onde parou.</li>
          <li><span aria-hidden="true">🔔</span> Receba atualizações importantes e novidades em primeira mão.</li>
          <li><span aria-hidden="true">⚙️</span> Personalize sua experiência ao seu gosto.</li>
        </ul>
      </aside>
    </main>
  );
};

export default Logar;