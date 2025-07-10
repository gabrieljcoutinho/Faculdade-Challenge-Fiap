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

import { tituloPrincipal, nome, Email, telefone, assunto, mensagem, anexarArquivo, dowloadArquivo, Enviarmensagem,
  btnPerguntasFrequentes, formasDecontato, rua, EmailDaEmpresa, TelefoneDaEmpresa
} from '../../constants/Contato/index.js'

const Contato = () => {
  const navigate = useNavigate();

const handleFaqClick = () => {
  navigate('/perguntas-frequentes');
};


  return (
    <div className="contato-container">
      <div className="contato-wrapper">
        <form className="contato-form" encType="multipart/form-data">
          <h2 className="tituloContato" title="Envie sua MEnsagem">{tituloPrincipal}</h2>

          <div className="form-group">
            <label htmlFor="nome" title="Nome">{nome}</label>
            <input type="text" id="nome" name="nome" title="Digite seu nome" placeholder="Seu nome completo" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">{Email}</label>
            <input type="email" id="email" name="email" title="Digite seu Email" placeholder="Email" required />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">{telefone}</label>
            <input type="tel" id="telefone" name="telefone" title="Digite seu Telefone"  placeholder="Telefone" />
          </div>

          <div className="form-group">
            <label htmlFor="assunto">{assunto}</label>
            <input type="text" id="assunto" name="assunto" title="Escreva o Título do Assunto" placeholder="Assunto" required />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">{mensagem}</label>
            <textarea id="mensagem" name="mensagem" rows="7" title="Descreva o Assunto" placeholder="Digite aqui..." required></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="arquivo" title=" Anexar Arquivos">{anexarArquivo}</label>
            <input
              type="file"
              id="arquivo"
              name="arquivo"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <small className="info-upload">{dowloadArquivo}</small>
          </div>

          <button type="submit" className="submit-button">{Enviarmensagem}</button>
        </form>

        {/* Botão de Perguntas Frequentes */}
        <div className="faq-button-container">
        <button onClick={handleFaqClick} className="faq-button">
  <span role="img" aria-label="Clipboard">📋</span> {btnPerguntasFrequentes}
</button>

        </div>

        <div className="contato-info">
          <p className="paragrafoContatoTitulo">{formasDecontato}</p>

          <div className="info-item">
            <FaMapMarkerAlt size={20} className="icon" />
            <p className="paragrafoContato"><strong>Endereço:</strong> {rua}</p>
          </div>

          <div className="info-item">
            <FaEnvelope size={20} className="icon" />
            <p className="paragrafoContato"><strong>Email:</strong> {EmailDaEmpresa}</p>
          </div>

          <div className="info-item">
            <FaPhone size={20} className="icon" />
            <p className="paragrafoContato"><strong>Telefone:</strong> {TelefoneDaEmpresa}</p>
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
