import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import '../../CSS/Chat/mediaScreen.css';
import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const normalizeText = (text) => text.trim().toLowerCase();

const formatProductionSummary = (productionData) => {
  if (
    !productionData ||
    !Array.isArray(productionData.labels) ||
    !Array.isArray(productionData.datasetsOptions) ||
    productionData.datasetsOptions.length === 0
  ) {
    return "Dados de produção solar não disponíveis.";
  }

  const labels = productionData.labels;
  const firstDataset = productionData.datasetsOptions[0];
  const data = firstDataset.data.slice(0, labels.length);

  let total = 0;
  let table = "Produção solar (Opção 1):\n\n| Hora | Produção (kWh) |\n|-------|---------------|\n";

  for (let i = 0; i < labels.length; i++) {
    const hour = labels[i];
    const value = data[i] || 0;
    total += value;
    table += `| ${hour} | ${value} |\n`;
  }

  table += `\nProdução total: ${total} kWh`;

  return table;
};

const Chat = ({ onConnectDevice, productionData, setTheme }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Foco automático ao carregar componente
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll para o final ao adicionar mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const texto = newMessage.trim();
    if (!texto) return;

    if (firstInteraction) setFirstInteraction(false);

    const textoNormalizado = normalizeText(texto);
    setMessages(prev => [...prev, { role: 'user', content: texto }]);
    setNewMessage('');
    setLoading(true);
    inputRef.current?.focus(); // Foco após envio

    let handledByLocalCommand = false;
    let botResponseContent = '';

    const connectionCommands = [
      { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão', 'oconectar tv', 'oconectar televisão'] },
      { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado', 'oconectar ar-condicionado', 'oconectar ar condicionado'] },
      { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada', 'oconectar lâmpada', 'oconectar lampada'] },
      { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry', 'oconectar airfry'] },
      { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador', 'oconectar carregador'] }
    ];

    let identifiedDeviceType = null;
    let fullDeviceNameForConnection = null;

    for (const cmd of connectionCommands) {
      for (const trigger of cmd.triggers) {
        const normalizedTrigger = normalizeText(trigger);
        if (textoNormalizado.startsWith(normalizedTrigger)) {
          identifiedDeviceType = cmd.type;
          let remainingText = texto.substring(trigger.length).trim();
          fullDeviceNameForConnection = remainingText
            ? `${cmd.type} ${remainingText.charAt(0).toUpperCase() + remainingText.slice(1)}`
            : cmd.type;

          if (typeof onConnectDevice === 'function') {
            onConnectDevice(identifiedDeviceType, fullDeviceNameForConnection);
          }

          botResponseContent = `${fullDeviceNameForConnection} conectado!`;
          handledByLocalCommand = true;
          break;
        }
      }
      if (handledByLocalCommand) break;
    }

    if (!handledByLocalCommand) {
      const comandoEncontrado = comandosData.comandos.find(cmd =>
        Array.isArray(cmd.triggers) && cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
      );

      if (comandoEncontrado) {
        if (comandoEncontrado.resposta.startsWith("REDIRECT:")) {
          setIsFadingOut(true);
          setTimeout(() => {
            const path = comandoEncontrado.resposta.split(":")[1];
            navigate(path);
          }, 700);
          setLoading(false);
          inputRef.current?.focus(); // Foco após redirect
          return;
        }

        if (comandoEncontrado.resposta === 'PRODUCAO_GRAFICO') {
          botResponseContent = formatProductionSummary(productionData);
        } else if (comandoEncontrado.resposta === 'TEMA_ESCURO') {
          document.body.classList.remove('light-theme');
          document.body.classList.add('dark-theme');
          localStorage.setItem('theme', 'dark-theme');
          if (setTheme) setTheme('dark-theme');
          botResponseContent = "Tema escuro ativado! 🌙";
        } else if (comandoEncontrado.resposta === 'TEMA_CLARO') {
          document.body.classList.remove('dark-theme');
          document.body.classList.add('light-theme');
          localStorage.setItem('theme', 'light-theme');
          if (setTheme) setTheme('light-theme');
          botResponseContent = "Tema claro ativado! ☀️";
        } else {
          botResponseContent = comandoEncontrado.resposta;
        }

        handledByLocalCommand = true;
      }
    }

    if (handledByLocalCommand) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
        setLoading(false);
        inputRef.current?.focus(); // Foco após comando local
      }, 500);
      return;
    }

    if (!GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
      setLoading(false);
      inputRef.current?.focus(); // Foco mesmo com erro
      return;
    }

    try {
      const geminiMessages = [
        { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: texto }] }
      ];

      const payload = {
        contents: geminiMessages,
        generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${response.status})` }
        ]);
        return;
      }

      if (data.candidates?.[0]?.content?.parts) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }
        ]);
      } else if (data.promptFeedback?.blockReason) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Sua mensagem foi bloqueada: ${data.promptFeedback.blockReason}` }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Resposta inválida da API Gemini' }
        ]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${error.message}` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus(); // Foco garantido no final
    }
  };

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

        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
          <div key={index} className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
            <span
              className="message-bubble"
              dangerouslySetInnerHTML={{
                __html: message.role === 'assistant'
                  ? marked.parse(message.content)
                  : message.content
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

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Sua mensagem..."
          className="message-input"
          disabled={loading}
          autoComplete="off"
          title='Digite seu texto ou sua mensagem'
        />
        <button type="submit" className="send-button" disabled={loading}>
          <img src={sendBtn} alt="Enviar" className="send-icon" title='Enviar Texto ou Mensagem' />
        </button>
      </form>
    </div>
  );
};

export default Chat;
