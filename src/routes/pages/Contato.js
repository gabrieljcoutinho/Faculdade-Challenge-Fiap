import React from 'react';
import '../../CSS/Contato/contato.css';
import { FaInstagram, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Contato = () => {
  return (
    <div className="contato-container">
      <div className="contato-header">
        <br />
      </div>

      <div className="contato-wrapper">
        <form className="contato-form">
          <h2>Envie sua Mensagem</h2>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Email" required />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <input type="tel" id="telefone" name="telefone" placeholder="Telefone" />
          </div>

          <div className="form-group">
            <label htmlFor="assunto">Assunto:</label>
            <input type="text" id="assunto" name="assunto" placeholder="Assunto" required />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Mensagem:</label>
            <textarea id="mensagem" name="mensagem" rows="7" placeholder="Digite aqui..." required></textarea>
          </div>

          <button type="submit" className="submit-button">Enviar Mensagem</button>
        </form>

        <div className="contato-info">
          <h2>Outras Formas de Contato</h2>
          <div className="info-item">
            <FaMapMarkerAlt size={20} className="icon" />
            <p><strong>Endereço:</strong> Rua Exemplo, 123 - Bairro Legal, São Paulo - SP</p>
          </div>
          <div className="info-item">
            <FaEnvelope size={20} className="icon" />
            <p><strong>Email:</strong> contato@exemplo.com.br</p>
          </div>
          <div className="info-item">
            <FaPhone size={20} className="icon" />
            <p><strong>Telefone:</strong> (11) 98765-4321</p>
          </div>

          <div className="social-icons">
            <h3>Nossas Redes Sociais</h3>
            <a href="https://www.instagram.com/goodwe_br/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={35} />
            </a>
            <a href="https://www.linkedin.com/search/results/all/?heroEntityKey=urn%3Ali%3Aorganization%3A2551475&keywords=GoodWe&origin=ENTITY_SEARCH_HOME_HISTORY&sid=1vJ" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={35} />
            </a>
            <a href="https://www.youtube.com/@goodwesolarengine" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube size={35} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;