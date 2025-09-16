// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../CSS/Header/menu.css';

import logoGoodWe from '../imgs/imgHeader/logo.png';

import home from '../imgs/imgHeader/home.png';
import homeAtivado from '../imgs/imgHeader/homeAtivado.png';
import wifi from '../imgs/imgHeader/wifi.png';
import wifiAtivado from '../imgs/imgHeader/wifiAtivado.png';
import contato from '../imgs/imgHeader/contato.png';
import contatoAtivado from '../imgs/imgHeader/contatoAtivado.png';
import chatIcon from '../imgs/imgHeader/chat.png';
import chatAtivado from '../imgs/imgHeader/chatAtivado.png'; // <- nova imagem
import settingsIcon from '../imgs/imgHeader/engrenagem.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const [ativo, setAtivo] = useState({
    home: false,
    wifi: false,
    contato: false,
    chat: false, // <- adicionado chat
  });

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

    const estadoSalvo = JSON.parse(sessionStorage.getItem('headerAtivo')) || {};
    setAtivo({
      home: estadoSalvo.home || false,
      wifi: estadoSalvo.wifi || false,
      contato: estadoSalvo.contato || false,
      chat: estadoSalvo.chat || false,
    });
  }, []);

  // Função para ativar ícone clicado
  const handleClick = (item) => {
    const novoAtivo = { home: false, wifi: false, contato: false, chat: false };
    if (item) novoAtivo[item] = true;

    setAtivo(novoAtivo);
    sessionStorage.setItem('headerAtivo', JSON.stringify(novoAtivo));
    closeMenu();
  };

  return (
    <header>
      <div id="main">
        <span id="menuIcon" onClick={toggleMenu} ref={buttonRef} title='Abrir Menu'>☰</span>
      </div>

      <img src={logoGoodWe} alt="" className='logoGoodwe'/>

      <div id="menu" className={menuOpen ? 'open' : ''} ref={menuRef}>
        <button className="close-btn" onClick={closeMenu} title='Fechar Menu'>x</button>

        <Link to="/" onClick={() => handleClick('home')} className={`linkHeader ${location.pathname === '/' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'>
            <img src={ativo.home ? homeAtivado : home} alt="Home" className='iconesHeader' title='Home' />
          </p>
        </Link>

        <br />

        <Link to="/conectarAparelhos" onClick={() => handleClick('wifi')} className={`linkHeader ${location.pathname === '/conectarAparelhos' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'>
            <img src={ativo.wifi ? wifiAtivado : wifi} alt="Wi-Fi" className='iconesHeader' title='Conexão' />
          </p>
        </Link>

        <br />

        <Link to="/chat" onClick={() => handleClick('chat')} className={`linkHeader ${location.pathname === '/chat' ? 'active' : ''}`} style={{ position: 'relative' }}>
          <p className='paragrafoListaHeader'>
            <img src={ativo.chat ? chatAtivado : chatIcon} alt="Chat" className='iconesHeader' title='Chat' />
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
          <Link to="/contato" onClick={() => handleClick('contato')} className={`linkHeader ${location.pathname === '/contato' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'>
              <img src={ativo.contato ? contatoAtivado : contato} alt="Contato" className='iconesHeader' title='Contato' />
            </p>
          </Link>

          <br />

          <Link to="/configuracoes" onClick={closeMenu} className={`linkHeader ${location.pathname === '/configuracoes' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'>
              <img src={settingsIcon} alt="Configurações" className='iconesHeader' title='Configurações' />
            </p>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
