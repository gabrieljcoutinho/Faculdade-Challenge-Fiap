import React, { useState } from 'react';
import '../../CSS/Cadastro/cadastro.css';
import { Link, useNavigate } from 'react-router-dom';

const Cadastro = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem.');
      return;
    }

    setTimeout(() => {
      console.log('Cadastro realizado com sucesso!');
      navigate('/');
    }, 2000);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const EyeIcon = ({ onClick, visible }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      className="password-toggle-icon"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {visible ? (
        <path d="M10.59 13.41c.41.41.41 1.08 0 1.49a1.03 1.03 0 0 1-1.42 0l-3-3a1.03 1.03 0 0 1 0-1.42l3-3a1.03 1.03 0 0 1 1.42 0c.41.41.41 1.08 0 1.49L9.7 12l.89 1.41zM13.41 10.59c.41-.41 1.08-.41 1.49 0l3 3a1.03 1.03 0 0 1 0 1.42l-3 3a1.03 1.03 0 0 1-1.42 0c-.41-.41-.41-1.08 0-1.49L14.3 12l-.89-1.41zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm5.34-11.59l-1.41 1.41C15.89 6.89 13.97 6 12 6c-1.97 0-3.89.89-5.34 2.41L5.66 9.41C8.06 6.94 10 6 12 6c2 0 3.94.94 6.34 2.41zM18.34 14.59L19.76 16c2.4-2.47 3.34-4.4 3.34-6s-.94-3.53-3.34-6l-1.41 1.41C21.94 8.06 24 10 24 12c0 2-2.06 3.94-4.34 5.59zM4.66 14.59C2.26 12.06 1 10 1 8c0-2 2.06-3.94 4.34-5.59L5.66 4C3.26 6.47 2.34 8.4 2.34 10s.94 3.53 3.34 6l1.41-1.41z" />
      ) : (
        <path d="M12 6a9.48 9.48 0 0 0-6.34 2.41L2 12l3.66 3.59A9.48 9.48 0 0 0 12 18c1.97 0 3.89-.89 5.34-2.41L22 12l-3.66-3.59A9.48 9.48 0 0 0 12 6zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      )}
    </svg>
  );

  return (
    <main className="cadastro-container">
      <section className="cadastro-box">
        <h1>Crie sua conta</h1>
        <form className="cadastro-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Seu e-mail"
              required
            />
          </div>
          <div className="input-group password-input-group">
            <label htmlFor="password" className='password'>Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Crie uma senha"
              required
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? 'error' : ''}
            />
            <EyeIcon onClick={togglePasswordVisibility} visible={showPassword} />
          </div>
          <div className="input-group password-input-group">
            <label htmlFor="confirmPassword" className='passwordConfirm'>Confirmar Senha</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirme sua senha"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={passwordError ? 'error' : ''}
            />
            <EyeIcon onClick={toggleConfirmPasswordVisibility} visible={showConfirmPassword} />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button type="submit" className="cadastro-button">
            Cadastrar
          </button>
        </form>
        <div className="links">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </section>
      <aside className="cadastro-info">
        <h2>Comece sua jornada conosco!</h2>
        <ul>
          <li>
            <span aria-hidden="true">🚀</span> Acesse todos os nossos recursos.
          </li>
          <li>
            <span aria-hidden="true">🤝</span> Conecte-se com nossa comunidade.
          </li>
          <li>
            <span aria-hidden="true">⭐</span> Desbloqueie benefícios exclusivos.
          </li>
        </ul>
      </aside>
    </main>
  );
};

export default Cadastro;
