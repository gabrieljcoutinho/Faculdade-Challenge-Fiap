import React from 'react';
import '../CSS/Footer/Footer.css'; // Importando o CSS do Footer
const Footer = () => {
  return (
      <div className='footerDiv'>
            <footer className="footer">
      <div>Este é o meu rodapé fixo na parte inferior da página</div>
      <p>&copy; {new Date().getFullYear()} Meu Website</p>
    </footer>
      </div>
  );
};

export default Footer;