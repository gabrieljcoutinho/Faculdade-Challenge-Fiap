import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Cadastro/cadastro.css';
import '../../CSS/Cadastro/input.css';
import '../../CSS/Cadastro/password.css';
import '../../CSS/Cadastro/links.css';
import '../../CSS/Cadastro/error.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: '', email: '' });
  const [showPasswords, setShowPasswords] = useState([false, false]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'Fraca';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'Forte';
    return 'Média';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ password: '', email: '' });

    if (!validateEmail(form.email)) {
      setErrors({ ...errors, email: 'E-mail inválido.' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrors({ ...errors, password: 'As senhas não conferem.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setSuccessMessage('Cadastro realizado com sucesso!');
      setTimeout(() => navigate('/'), 2000);
    }, 1500);
  };

  const EyeIcon = ({ onClick, visible }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="password-toggle-icon" onClick={onClick} style={{ cursor: 'pointer' }}>
      {visible ? (
        <path d="M1.39 4.22l2.26 2.26C2.57 7.74 1 9.72 1 12c0 2 2.06 3.94 4.34 5.59l1.41-1.41C5.11 15.11 4 13.62 4 12c0-1.17.52-2.24 1.36-3.01l1.54 1.54A3.5 3.5 0 0 0 12 15a3.5 3.5 0 0 0 3.47-4.14l3.27 3.27C21.6 12.47 23 10.42 23 8c0-2-2.06-3.94-4.34-5.59L18.24 4C20.74 6.47 22 8.4 22 10s-.94 3.53-3.34 6l1.41 1.41c2.4-2.47 3.34-4.4 3.34-6 0-2.28-1.57-4.26-3.66-5.52l2.27-2.26-1.42-1.42L2.81 2.81 1.39 4.22zM12 6a9.48 9.48 0 0 0-6.34 2.41L5.66 9.41C8.06 6.94 10 6 12 6c1.06 0 2.09.27 3.03.77L12 9.88V6z" />
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
          {['nome', 'email'].map((field) => (
            <div key={field} className="input-group">
              <label htmlFor={field}>{field === 'nome' ? 'Nome' : 'E-mail'}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                id={field}
                placeholder={field === 'nome' ? 'Seu nome completo' : 'Seu e-mail'}
                required
                value={form[field]}
                onChange={handleChange}
                className={errors[field] ? 'error' : ''}
              />
              {errors[field] && <p className="error-message">{errors[field]}</p>}
            </div>
          ))}
          {['password', 'confirmPassword'].map((field, i) => (
            <div key={field} className="input-group password-input-group">
              <label htmlFor={field}>{field === 'password' ? 'Senha' : 'Confirmar Senha'}</label>
              <input
                type={showPasswords[i] ? 'text' : 'password'}
                id={field}
                placeholder={field === 'password' ? 'Crie uma senha' : 'Confirme sua senha'}
                required
                value={form[field]}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              <EyeIcon onClick={() => setShowPasswords(showPasswords.map((v, j) => j === i ? !v : v))} visible={showPasswords[i]} />
              {field === 'password' && (
                <small className={`password-strength ${getPasswordStrength(form.password).toLowerCase()}`}>
                  Força: {getPasswordStrength(form.password)}
                </small>
              )}
            </div>
          ))}
          {errors.password && <p className="error-message">{errors.password}</p>}
          <button type="submit" className="cadastro-button" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {successMessage && <div className="success-message animated">🎉 {successMessage}</div>}

        <div className="links">
          <p className='temConta'><Link to="/login">Já tem uma conta?  Faça login</Link></p>
        </div>
      </section>

      <aside className="cadastro-info">
        <h2>Comece sua jornada conosco!</h2>
        <ul>
          <li>🚀 Acesse todos os nossos recursos.</li>
          <li>🤝 Conecte-se com nossa comunidade.</li>
          <li>⭐ Desbloqueie benefícios exclusivos.</li>
        </ul>
      </aside>
      <br /><br /><br />
    </main>
  );
};

export default Cadastro;
