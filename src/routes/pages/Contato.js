import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Contato/contato.css';

import '../../CSS/Contato/formulario.css';
import '../../CSS/Contato/campoArquivo.css';
import '../../CSS/Contato/btnFormularioEnviao.css'
import '../../CSS/Contato/infomacaoContato.css'
import '../../CSS/Contato/icones.css'

import '../../CSS/Contato/mediaScren.css';
import { FaInstagram, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Contato = () => {
  const navigate = useNavigate();

const handleFaqClick = () => {
  navigate('/perguntas-frequentes');
};


  return (
    <div className="contato-container">
      <div className="contato-wrapper">
        <form className="contato-form" encType="multipart/form-data">
          <h2 className="tituloContato" title="Envie sua MEnsagem">Envie sua Mensagem</h2>

          <div className="form-group">
            <label htmlFor="nome" title="Nome">Nome:</label>
            <input type="text" id="nome" name="nome" title="Digite seu nome" placeholder="Seu nome completo" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" title="Digite seu Email" placeholder="Email" required />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <input type="tel" id="telefone" name="telefone" title="Digite seu Telefone"  placeholder="Telefone" />
          </div>

          <div className="form-group">
            <label htmlFor="assunto">Assunto:</label>
            <input type="text" id="assunto" name="assunto" title="Escreva o Título do Assunto" placeholder="Assunto" required />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Mensagem:</label>
            <textarea id="mensagem" name="mensagem" rows="7" title="Descreva o Assunto" placeholder="Digite aqui..." required></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="arquivo" title=" Anexar Arquivos">Anexar Arquivo:</label>
            <input
              type="file"
              id="arquivo"
              name="arquivo"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <small className="info-upload">Formatos permitidos: JPG, PNG, PDF, DOC</small>
          </div>

          <button type="submit" className="submit-button">Enviar Mensagem</button>
        </form>

        {/* Botão de Perguntas Frequentes */}
        <div className="faq-button-container">
        <button onClick={handleFaqClick} className="faq-button">
  <span role="img" aria-label="Clipboard">📋</span> Ver Perguntas Frequentes
</button>

        </div>

        <div className="contato-info">
          <p className="paragrafoContatoTitulo">Outras Formas de Contato</p>

          <div className="info-item">
            <FaMapMarkerAlt size={20} className="icon" />
            <p className="paragrafoContato"><strong>Endereço:</strong> Rua Exemplo, 123 - Bairro Teste, São Paulo - SP</p>
          </div>

          <div className="info-item">
            <FaEnvelope size={20} className="icon" />
            <p className="paragrafoContato"><strong>Email:</strong> contato@exemplo.com.br</p>
          </div>

          <div className="info-item">
            <FaPhone size={20} className="icon" />
            <p className="paragrafoContato"><strong>Telefone:</strong> (99) 99999-9999</p>
          </div>

          <div className="social-icons" title="IconesRedes Sociais">
            <a href="https://www.instagram.com/goodwe_br/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Icone Instagram">
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
