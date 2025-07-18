import React from 'react';
import '../CSS/Footer/Footer.css'; 
const Footer = () => {
  return (
      <div className='footerDiv'>
            <footer className="footer">

      <p>&copy; {new Date().getFullYear()} GoodWe App</p>
    </footer>
      </div>
  );
};

export default Footer;