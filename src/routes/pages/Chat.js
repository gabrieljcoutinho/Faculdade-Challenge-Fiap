import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/mediaScreen.css';
import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const normalizeText = t => t.trim().toLowerCase();

const formatProductionSummary = d =>
  !d || !Array.isArray(d.labels) || !Array.isArray(d.datasetsOptions) || !d.datasetsOptions.length
    ? "Dados de produção solar não disponíveis."
    : (() => {
        const { labels } = d, data = d.datasetsOptions[0].data.slice(0, labels.length);
        let total = 0, table = "Produção solar (Opção 1):\n\n| Hora | Produção (kWh) |\n|-------|---------------|\n";
        labels.forEach((h, i) => { const v = data[i] || 0; total += v; table += `| ${h} | ${v} |\n`; });
        return table + `\nProdução total: ${total} kWh`;
      })();

const Chat = ({ onConnectDevice, productionData, setTheme }) => {
  const [messages, setMessages] = useState([]),
        [newMessage, setNewMessage] = useState(''),
        [loading, setLoading] = useState(false),
        [firstInteraction, setFirstInteraction] = useState(true),
        [isFadingOut, setIsFadingOut] = useState(false);

  const messagesEndRef = useRef(null), inputRef = useRef(null), navigate = useNavigate();

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    const texto = newMessage.trim();
    if (!texto) return;
    if (firstInteraction) setFirstInteraction(false);
    setMessages(m => [...m, { role: 'user', content: texto }]);
    setNewMessage('');
    setLoading(true);
    inputRef.current?.focus();

    const textoNormalizado = normalizeText(texto);

    const connectionCommands = [
      { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão', 'oconectar tv', 'oconectar televisão'] },
      { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado', 'oconectar ar-condicionado', 'oconectar ar condicionado'] },
      { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada', 'oconectar lâmpada', 'oconectar lampada'] },
      { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry', 'oconectar airfry'] },
      { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador', 'oconectar carregador'] }
    ];

    let handledByLocalCommand = false;
    let botResponseContent = '';

    for (const cmd of connectionCommands) {
      const trigger = cmd.triggers.find(t => textoNormalizado.startsWith(normalizeText(t)));
      if (trigger) {
        const remaining = texto.substring(trigger.length).trim();

        const matchMinutos = remaining.match(/daqui\s+(\d+)\s+minuto/);
        const matchHoras = remaining.match(/às\s+(\d{1,2})(h|:)?(\d{0,2})?/i);

        let agendarEmMs = null;
        const agora = new Date();

        if (matchMinutos) {
          const minutos = parseInt(matchMinutos[1]);
          agendarEmMs = minutos * 60 * 1000;
        } else if (matchHoras) {
          const horas = parseInt(matchHoras[1]);
          const minutos = parseInt(matchHoras[3] || "0");
          const alvo = new Date();
          alvo.setHours(horas, minutos, 0, 0);
          agendarEmMs = alvo - agora > 0 ? alvo - agora : null;
        }

        const fullName = remaining ? `${cmd.type} ${remaining}` : cmd.type;

        if (agendarEmMs && agendarEmMs > 0) {
          setMessages(m => [...m, { role: 'assistant', content: `📅 Agendado: ${fullName} será conectado em ${Math.round(agendarEmMs / 60000)} minuto(s)!` }]);
          onConnectDevice?.(cmd.type, fullName, { agendado: true });

          setTimeout(() => {
            onConnectDevice?.(cmd.type, fullName);
            setMessages(m => [...m, { role: 'assistant', content: `✅ ${fullName} conectado automaticamente!` }]);
          }, agendarEmMs);
        } else {
          onConnectDevice?.(cmd.type, fullName);
          botResponseContent = `${fullName} conectado!`;
          setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
        }

        handledByLocalCommand = true;
        break;
      }
    }

    if (!handledByLocalCommand) {
      const foundCmd = comandosData.comandos.find(c => c.triggers?.some(t => normalizeText(t) === textoNormalizado));
      if (foundCmd) {
        if (foundCmd.resposta.startsWith("REDIRECT:")) {
          setIsFadingOut(true);
          setTimeout(() => navigate(foundCmd.resposta.split(":")[1]), 700);
          setLoading(false);
          inputRef.current?.focus();
          return;
        }
        switch (foundCmd.resposta) {
          case 'PRODUCAO_GRAFICO':
            botResponseContent = formatProductionSummary(productionData);
            break;
          case 'TEMA_ESCURO':
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            setTheme?.('dark-theme');
            botResponseContent = "Tema escuro ativado! 🌙";
            break;
          case 'TEMA_CLARO':
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
            setTheme?.('light-theme');
            botResponseContent = "Tema claro ativado! ☀️";
            break;
          default:
            botResponseContent = foundCmd.resposta;
        }
        setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
        setLoading(false);
        inputRef.current?.focus();
        return;
      }
    }

    if (!GEMINI_API_KEY) {
      setMessages(m => [...m, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
      setLoading(false);
      inputRef.current?.focus();
      return;
    }

    try {
      const geminiMessages = [
        { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: texto }] }
      ];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(m => [...m, { role: 'assistant', content: `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${res.status})` }]);
      } else if (data.candidates?.[0]?.content?.parts) {
        setMessages(m => [...m, { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }]);
      } else if (data.promptFeedback?.blockReason) {
        setMessages(m => [...m, { role: 'assistant', content: `Sua mensagem foi bloqueada: ${data.promptFeedback.blockReason}` }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Resposta inválida da API Gemini' }]);
      }
    } catch (error) {
      setMessages(m => [...m, { role: 'assistant', content: `Erro: ${error.message}` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
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
        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user' : 'bot'}`}>
            <span className="message-bubble" dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? marked.parse(m.content) : m.content }} />
          </div>
        ))}
        {loading && <div className="message bot"><span className="message-bubble">Digitando...</span></div>}
        <div ref={messagesEndRef} />
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
          title="Digite seu texto ou sua mensagem"
        />
        <button type="submit" className="send-button" disabled={loading}>
          <img src={sendBtn} alt="Enviar" className="send-icon" title="Enviar Texto ou Mensagem" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
