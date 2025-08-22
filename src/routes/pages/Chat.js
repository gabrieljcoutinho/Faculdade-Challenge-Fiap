import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/quickSuggestions.css';
import '../../CSS/Chat/logoGoodweChat.css';

import '../../CSS/Chat/mediaScreen.css';
import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';

import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';

// >>> IMPORTA A IMAGEM QUE VAI FICAR NO MEIO DO CHAT
import chatImage from '../../imgs/imgHeader/logo.png'; ///AQUI ESTA A IMAGEM

const GEMINI_API_KEY = '...';
const OPENWEATHER_API_KEY = '...';
const CHAT_STORAGE_KEY = 'chat_messages';
const FIRST_INTERACTION_KEY = 'chat_firstInteraction';
const NEW_MESSAGE_FLAG = 'hasNewChatMessage';

const normalizeText = t => t.trim().toLowerCase();

const deviceIconMap = {
  TV: tvIcon,
  'Ar-Condicionado': airConditionerIcon,
  'Lâmpada': lampIcon,
  Geladeira: geladeira,
  Carregador: carregador,
};

const Chat = ({ onConnectDevice, onDisconnectAll, onRemoveAll, productionData, setTheme, onConnectionTypeChange }) => {
  const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)) || []);
  const [firstInteraction, setFirstInteraction] = useState(() => {
    const saved = sessionStorage.getItem(FIRST_INTERACTION_KEY);
    return saved === null ? true : JSON.parse(saved);
  });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [awaitingACConfirmation, setAwaitingACConfirmation] = useState(false);
  const [speakMode, setSpeakMode] = useState(() => sessionStorage.getItem('chat_speakMode') === 'true');
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // NOVO: controla a exibição da imagem de fundo
  const [showBackgroundImage, setShowBackgroundImage] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const quickSuggestions = ['Conectar TV','Conectar Ar-Condicionado','Conectar Lâmpada','Conectar Geladeira','Conectar Carregador'];

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  useEffect(() => sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)), [messages]);
  useEffect(() => sessionStorage.setItem(FIRST_INTERACTION_KEY, JSON.stringify(firstInteraction)), [firstInteraction]);
  useEffect(() => sessionStorage.setItem(NEW_MESSAGE_FLAG, hasNewMessage ? 'true' : 'false'), [hasNewMessage]);
  useEffect(() => sessionStorage.setItem('chat_speakMode', speakMode ? 'true' : 'false'), [speakMode]);

  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
      sessionStorage.removeItem(FIRST_INTERACTION_KEY);
      sessionStorage.removeItem(NEW_MESSAGE_FLAG);
      sessionStorage.removeItem('chat_speakMode');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const sendAssistantMessage = content => {
    setMessages(m => [...m, { role: 'assistant', content }]);
  };

  const handleSendMessage = useCallback(async e => {
    e?.preventDefault();
    const texto = newMessage.trim();
    if (!texto) return;
    setNewMessage('');
    setLoading(true);
    inputRef.current?.focus();

    // Assim que o usuário enviar a primeira mensagem, some com a imagem
    if (showBackgroundImage) {
      setShowBackgroundImage(false);
    }

    if (firstInteraction) setFirstInteraction(false);
    setMessages(m => [...m, { role: 'user', content: texto }]);

    // ... (resto do seu código de comandos / IA continua igual)

    setLoading(false);
    inputRef.current?.focus();
  }, [newMessage, firstInteraction, showBackgroundImage]);

  return (
    <div className={`chat-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="message-display-area">
        {firstInteraction && (
          <div className="movimentoDaDiv">
            <div className="messageBot">
              <span className="message-bubble messagemInicial">
                💡 Digite <strong>Comandos</strong> para receber comandos específicos do site.
              </span>
            </div>
          </div>
        )}

        {/* MOSTRA A IMAGEM APENAS ENQUANTO NÃO HOUVER MENSAGEM */}
        {showBackgroundImage && (
          <div className="chat-background-image">
            <img src={chatImage} alt="Imagem do chat" />
          </div>
        )}

        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user' : 'bot'}`}>
            <span
              className="message-bubble"
              dangerouslySetInnerHTML={{
                __html: m.role === 'assistant'
                  ? DOMPurify.sanitize(marked.parse(m.content))
                  : DOMPurify.sanitize(m.content)
              }}
            />
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <span className="message-bubble">Digitando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-suggestions">
        {quickSuggestions.map((s, index) => (
          <button key={index} type="button" className="suggestion-button" onClick={() => setNewMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Sua mensagem..."
          className="message-input"
          disabled={loading}
          autoComplete="off"
        />
        <button type="submit" className="send-button" disabled={loading}>
          <img src={sendBtn} alt="Enviar" className="send-icon" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
