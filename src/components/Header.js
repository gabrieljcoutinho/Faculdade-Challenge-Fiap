import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Header/header.css';
import '../CSS/Header/menu.css';

import home from '../imgs/home.png';
import wifi from '../imgs/wifi.png';
import contato from '../imgs/contato.png';
import settingsIcon from '../imgs/engrenagem.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('overlay-active');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('overlay-active');
  };

  const openSettings = () => {
    closeMenu();
    navigate('/configuracoes');
  };

  return (
    <header>
      <div id="main">
        <span id="menuIcon" onClick={toggleMenu} className='btnBurguer'>☰</span>
      </div>
      <div id="menu" className={menuOpen ? 'open' : ''}>
        <button className="close-btn" onClick={closeMenu}> x </button>
        <Link
          to="/"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={home} alt="" className='iconesHeader' title='Home' /></p>
        </Link>

        <br /><br />

        <Link
          to="/conexoes"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/conexoes' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={wifi} alt="" className='iconesHeader' title='Conexão' /></p>
        </Link>

        <br /><br />

        <div className='contato-configuracoes'> {/* Container para contato e configurações */}
          <Link
            to="/contato"
            onClick={closeMenu}
            className={`linkHeader ${location.pathname === '/contato' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'> <img src={contato} alt="" className='iconesHeader teste' title='Contato' /></p>
          </Link>

         <Link>
          <div
            onClick={openSettings}
            className='linkHeader configuracoes-link' // Adicionando uma classe para estilização
            style={{ cursor: 'pointer' }}>
            <p className='paragrafoListaHeader'> <img src={settingsIcon} alt="Configurações" className='iconesHeader' title='Configurações' /></p>
          </div></Link>
        </div>
      </div>
    </header>
  );
};

export default Header;