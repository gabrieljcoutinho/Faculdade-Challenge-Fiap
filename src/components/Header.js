// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../CSS/Header/menu.css';

import home from '../imgs/imgHeader/home.png';
import wifi from '../imgs/imgHeader/wifi.png';
import contato from '../imgs/imgHeader/contato.png';
import chatIcon from '../imgs/imgHeader/chat.png';
import settingsIcon from '../imgs/imgHeader/engrenagem.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false); // estado para bolinha vermelha
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('overlay-active');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('overlay-active');
  };

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Lê do sessionStorage se tem nova mensagem
  useEffect(() => {
    const novaMsg = sessionStorage.getItem('hasNewChatMessage');
    setHasNewMessage(novaMsg === 'true');
  }, []);

  // Quando o usuário entra na página /chat, limpar notificação
  useEffect(() => {
    if (location.pathname === '/chat') {
      setHasNewMessage(false);
      sessionStorage.setItem('hasNewChatMessage', 'false');
    }
  }, [location.pathname]);

  return (
    <header>
      <div id="main">
        <span
          id="menuIcon"
          onClick={toggleMenu}
          ref={buttonRef}
          title='Abrir Menu'
        >☰</span>
      </div>

      <div
        id="menu"
        className={menuOpen ? 'open' : ''}
        ref={menuRef}
      >
        <button className="close-btn" onClick={closeMenu} title='Fechar Menu'>x</button>

        <Link to="/" onClick={closeMenu} className={`linkHeader ${location.pathname === '/' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={home} alt="" className='iconesHeader' title='Home' /></p>
        </Link>

        <br />

        <Link to="/conexoes" onClick={closeMenu} className={`linkHeader ${location.pathname === '/conexoes' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={wifi} alt="" className='iconesHeader' title='Conexão' /></p>
        </Link>

        <br />

        <Link to="/chat" onClick={closeMenu} className={`linkHeader ${location.pathname === '/chat' ? 'active' : ''}`} style={{ position: 'relative' }}>
          <p className='paragrafoListaHeader'>
            <img src={chatIcon} alt="Chat" className='iconesHeader' title='Chat' />
            {hasNewMessage && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  border: '2px solid white',
                  pointerEvents: 'none',
                }}
                title="Nova mensagem"
              />
            )}
          </p>
        </Link>

        <br />

        <div className='contato-configuracoes'>
          <Link to="/contato" onClick={closeMenu} className={`linkHeader ${location.pathname === '/contato' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'><img src={contato} alt="" className='iconesHeader teste' title='Contato' /></p>
          </Link>

          <br />

          <Link to="/configuracoes" onClick={closeMenu} className={`linkHeader ${location.pathname === '/configuracoes' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'><img src={settingsIcon} alt="Configurações" className='iconesHeader' title='Configurações' /></p>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
