import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../CSS/Header/header.css';
import '../CSS/Header/menu.css';

import home from '../imgs/home.png';
import wifi from '../imgs/wifi.png';
import contato from '../imgs/contato.png';
import chatIcon from '../imgs/chat.png'; // Assuming you have a chat.png image
import settingsIcon from '../imgs/engrenagem.png';
import mapa from '../imgs/mapa.png'; // Assuming you have a maps.png image



const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();


  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('overlay-active');
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('overlay-active');
  };



  return (
    <header>
      <div id="main">
        <span id="menuIcon" onClick={toggleMenu} className='btnBurguer' title='Abrir Menu'>☰</span>
      </div>
      <div id="menu" className={menuOpen ? 'open' : ''}>
        <button className="close-btn" onClick={closeMenu} title='Fechar Menu'> x </button>
        <Link
          to="/"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={home} alt="" className='iconesHeader' title='Home' /></p>
        </Link>

        <br />

        <Link
          to="/conexoes"
          onClick={closeMenu}
          className={`linkHeader ${location.pathname === '/conexoes' ? 'active' : ''}`}>
          <p className='paragrafoListaHeader'><img src={wifi} alt="" className='iconesHeader' title='Conexão' /></p>
        </Link>

        <br />

          <Link
            to="/chat" // You'll need to define a route for your chat page
            onClick={closeMenu}
            className={`linkHeader ${location.pathname === '/chat' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'> <img src={chatIcon} alt="Chat" className='iconesHeader' title='Chat' /></p>
          </Link>
          <br />


           <div className='contato-configuracoes'> {/* Container para contato e configurações */}
          <Link
            to="/contato"
            onClick={closeMenu}
            className={`linkHeader ${location.pathname === '/contato' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'> <img src={contato} alt="" className='iconesHeader teste' title='Contato' /></p>
          </Link>


              <Link
            to="/mapa"
            onClick={closeMenu}
            className={`linkHeader ${location.pathname === '/mapa' ? 'active' : ''}`}>
            <p className='paragrafoListaHeader'> <img src={mapa} alt="" className='iconesHeader teste' title='Mapa' /></p>
          </Link>

     <br />

          <Link
  to="/configuracoes"
  onClick={closeMenu}
  className={`linkHeader ${location.pathname === '/configuracoes' ? 'active' : ''}`}>
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