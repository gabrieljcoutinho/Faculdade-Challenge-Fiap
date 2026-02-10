import React from 'react';
import '../CSS/Footer/Footer.module.css';
const Footer = () => {
  return (
      <div className='footerDiv'>
            <footer className="footer">

      <p>&copy; {new Date().getFullYear()} PROJETO ACADÊMICO</p>
    </footer>
      </div>
  );
};

export default Footer;