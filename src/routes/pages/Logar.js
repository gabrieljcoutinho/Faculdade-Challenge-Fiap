import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Login/container.module.css';
import '../../CSS/Login/login-box.css';
import '../../CSS/Login/social-buttons.css';
import '../../CSS/Login/separator.css';
import '../../CSS/Login/links.css';
import '../../CSS/Login/login-info.css';
import { tituloPrincipal, Email, Senha, BotaoEntrar, BotaoEntrarcontaGoogle, BotaoEntrarContaFacebook, BotaoEntrarContaLinkedin, esqueceuSenha, naoTemConta } from '../../constants/Logar/index.js';

const Logar = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const handleSubmit = e => { e.preventDefault(); console.log('Login com email:', email); navigate('/'); };
  const handleGoogleLogin = () => { console.log('Login com Google'); navigate('/'); };
  const handleFacebookLogin = () => { console.log('Login com Facebook'); navigate('/'); };
  const handleLinkedInLogin = () => { console.log('Login com LinkedIn'); navigate('/'); };
  const socialButtonStyle = { color: 'white', padding: '0.6rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '0.5rem' };

  return (
    <main className="login-container">
      <section className="login-box">
        <h1>{tituloPrincipal}</h1>



        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">{Email}</label>
            <input title="Digite Seu Email" className='inputEmail' type="email" id="email" placeholder="Seu e-mail" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="password" >{Senha}</label>
            <div className="inputSenha">
              <input type={showPass ? 'text' : 'password'} title="Digite sua Senha" placeholder="Sua senha" required value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="password-toggle-button" onClick={() => setShowPass(!showPass)} title="Mostrar / Ocultar Senha">{showPass ? '🔓' : '🔒'}</button>
            </div>
          </div>
          <button type="submit" className="login-button">{BotaoEntrar}</button>
        </form>



        <div className="or-separator" style={{ margin: '1rem 0', textAlign: 'center' }}><span>ou</span></div>

        <button type="button" onClick={handleGoogleLogin} style={{ ...socialButtonStyle, backgroundColor: '#4285F4' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="20" height="20" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
            <path fill="#4285F4" d="M533.5 278.4c0-18.8-1.5-37-4.5-54.7H272v103.7h146.8c-6.3 33.8-25 62.4-53.3 81.6v67h86.1c50.5-46.5 79.9-115 79.9-197.6z" />
            <path fill="#34A853" d="M272 544.3c72.6 0 133.7-24 178.3-65.2l-86.1-67c-23.9 16-54.7 25.5-92.2 25.5-70.9 0-131-47.9-152.4-112.3h-89.5v70.6c44.3 87 134.7 148.4 241.9 148.4z" />
            <path fill="#FBBC05" d="M119.6 324.9c-10.8-31.5-10.8-65.6 0-97.1v-70.6h-89.5c-38.3 74.4-38.3 162.4 0 236.8l89.5-69.1z" />
            <path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 103 40.4l77.3-77.3C405.3 24.3 347.3 0 272 0 164.8 0 74.4 61.4 30.1 148.4l89.5 69.1c21.4-64.4 81.5-112.3 152.4-112.3z" />
          </svg>
          {BotaoEntrarcontaGoogle}
        </button>

        <button type="button" onClick={handleFacebookLogin} style={{ ...socialButtonStyle, backgroundColor: '#3b5998' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.588l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.676V1.325C24 .6 23.4 0 22.675 0z" />
          </svg>
          {BotaoEntrarContaFacebook}
        </button>

        <button type="button" onClick={handleLinkedInLogin} style={{ ...socialButtonStyle, backgroundColor: '#0077B5' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.037-1.85-3.037-1.853 0-2.136 1.446-2.136 2.941v5.665H9.355V9h3.414v1.561h.047c.476-.9 1.637-1.85 3.367-1.85 3.602 0 4.269 2.37 4.269 5.452v6.289zM5.337 7.433a2.07 2.07 0 11-.001-4.14 2.07 2.07 0 01.001 4.14zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.546C0 23.227.792 24 1.771 24h20.451c.98 0 1.778-.773 1.778-1.727V1.727C24 .774 23.206 0 22.225 0z"/>
          </svg>
          {BotaoEntrarContaLinkedin}
        </button>

        <div className="links">
          <Link to="/esqueciSenha">{esqueceuSenha}</Link>
          <p><Link to="/cadastro">{naoTemConta}</Link></p>
        </div>
      </section>

      <aside className="login-info">
        <h2>Por que se juntar a nós?</h2>
        <ul>
          {['✨', '💾', '🔔', '⚙️'].map((icon, i) => (
            <li key={i}><span aria-hidden="true">{icon}</span> {['Descubra um mundo de recursos exclusivos', 'Salve seu progresso e continue de onde parou', 'Receba atualizações importantes e novidades', 'Personalize sua experiência ao seu gosto'][i]}</li>
          ))}
        </ul>
      </aside>
      <br /><br /><br />
    </main>
  );
};

export default Logar;
