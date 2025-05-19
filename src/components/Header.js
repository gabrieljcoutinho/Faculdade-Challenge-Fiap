import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Header/header.css'; // Importe o arquivo CSS
import '../CSS/Header/menu.css';

import home from '../imgs/home.png';
import wifi from '../imgs/wifi.png';
import contato from '../imgs/contato.png';
import settingsIcon from '../imgs/engrenagem.png'; // Importe o ícone de engrenagem


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Hook para acessar a localização atual
  const navigate = useNavigate(); // Hook para navegação

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('overlay-active');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('overlay-active');
  };

  const openSettings = () => {
    closeMenu(); // Fechar o menu antes de navegar
    navigate('/configuracoes'); // Navega para a página de configurações
  };

  return (
    <header>
      <div id="main">
        <span id="menuIcon" onClick={toggleMenu}>☰</span>
      </div>
      <div id="menu" className={menuOpen ? 'open' : ''}>
        <button className="close-btn" onClick={closeMenu}> x </button>
        <Link
          to="/"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/' ? 'active' : ''}`}
        >
          <p className='paragrafoListaHeader'><img src={home} alt=""  className='iconesHeader' title='Home' /></p>
        </Link>

        <br /><br />

        <Link
          to="/conexoes"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/conexoes' ? 'active' : ''}`}
        >
          <p className='paragrafoListaHeader'><img src={wifi} alt=""  className='iconesHeader' title='Conexão' /></p>
        </Link>

        <br /><br />

        <Link
          to="/contato"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/contato' ? 'active' : ''}`}
        >
          <p className='paragrafoListaHeader'> <img src={contato} alt=""  className='iconesHeader  teste' title='Contato'  /></p>
        </Link>

        <img
          src={settingsIcon}
          alt="Configurações"
          className='imgHeader'
          title='Configurações'
          onClick={openSettings}
          style={{ cursor: 'pointer'}} // Adicione um cursor para indicar que é clicável
        />
      </div>
    </header>
  );
};

export default Header;