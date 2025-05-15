import React from 'react';
import '../CSS/Footer/Footer.css'; // Importando o CSS do Footer
const Footer = () => {
  return (
    <footer className="footer"> {/* Use a classe CSS 'footer' */}
      <div>Este é o meu rodapé fixo na parte inferior da página</div>
      <p>&copy; {new Date().getFullYear()} Meu Website</p>
    </footer>
  );
};

export default Footer;