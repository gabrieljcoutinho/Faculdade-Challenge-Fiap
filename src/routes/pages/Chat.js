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

// Importe as imagens dos ícones para que o chat possa acessá-las
import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import airfry from '../../imgs/imgConexao/airfry.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const normalizeText = t => t.trim().toLowerCase();

const formatProductionSummary = d => !d || !Array.isArray(d.labels) || !Array.isArray(d.datasets) || !d.datasets.length
  ? "Dados de produção solar não disponíveis."
  : (() => {
    const { labels } = d, data = d.datasets[0].data.slice(0, labels.length);
    let total = 0, table = "Produção solar (Opção 1):\n\n| Hora | Produção (kWh) |\n|-------|---------------|\n";
    labels.forEach((h, i) => { const v = data[i] || 0; total += v; table += `| ${h} | ${v} |\n`; });
    return table + `\nProdução total: ${total} kWh`;
  })();

// Mapeamento dos tipos de dispositivo para seus ícones
const deviceIconMap = {
  'TV': tvIcon,
  'Ar-Condicionado': airConditionerIcon,
  'Lâmpada': lampIcon,
  'Airfry': airfry,
  'Carregador': carregador,
};

const CHAT_STORAGE_KEY = 'chat_messages';
const FIRST_INTERACTION_KEY = 'chat_firstInteraction';

const Chat = ({ onConnectDevice, productionData, setTheme }) => {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [firstInteraction, setFirstInteraction] = useState(() => {
    const saved = sessionStorage.getItem(FIRST_INTERACTION_KEY);
    return saved === null ? true : JSON.parse(saved);
  });

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  // Salva as mensagens e o firstInteraction no sessionStorage ao mudarem
  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem(FIRST_INTERACTION_KEY, JSON.stringify(firstInteraction));
  }, [firstInteraction]);

  // Limpa o sessionStorage quando recarregar a página (F5 ou reload)
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
      sessionStorage.removeItem(FIRST_INTERACTION_KEY);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // ... (todo seu handleSendMessage e lógica permanece igual)

  const connectionCommands = [
    { type: 'TV', keywords: ['tv', 'televisao', 'televisão'] },
    { type: 'Ar-Condicionado', keywords: ['ar-condicionado', 'ar condicionado'] },
    { type: 'Lâmpada', keywords: ['lampada', 'lâmpada'] },
    { type: 'Airfry', keywords: ['airfry'] },
    { type: 'Carregador', keywords: ['carregador'] }
  ];

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

    let handledByLocalCommand = false;
    let botResponseContent = '';

    if (textoNormalizado.startsWith('conectar')) {
      let afterConectarOriginal = texto.slice('conectar'.length).trim();
      if (afterConectarOriginal.toLowerCase().startsWith('a ')) {
        afterConectarOriginal = afterConectarOriginal.slice(2).trim();
      }

      const partesOriginal = afterConectarOriginal.split(' ');
      const partesLower = partesOriginal.map(p => p.toLowerCase());

      if (partesLower.length >= 1) {
        let tipoEncontrado = null;

        for (const cmd of connectionCommands) {
          if (cmd.keywords.includes(partesLower[0])) {
            tipoEncontrado = cmd.type;
            break;
          }
        }

        if (tipoEncontrado) {
          const nomePersonalizadoRaw = partesOriginal.slice(1).join(' ');
          const nomeCompleto = nomePersonalizadoRaw
            ? `${tipoEncontrado} ${nomePersonalizadoRaw}`
            : tipoEncontrado;

          const iconSrc = deviceIconMap[tipoEncontrado];

          if (iconSrc) {
            onConnectDevice?.(nomeCompleto, iconSrc);
            botResponseContent = `${nomeCompleto} conectado!`;
            handledByLocalCommand = true;
          } else {
            botResponseContent = `Não foi possível encontrar o ícone para ${tipoEncontrado}. O aparelho foi conectado com um ícone padrão.`;
            onConnectDevice?.(nomeCompleto, null);
            handledByLocalCommand = true;
          }
        }
      }
    }

    if (!handledByLocalCommand) {
      const foundCmd = comandosData.comandos.find(c =>
        c.triggers?.some(t => normalizeText(t) === textoNormalizado)
      );

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
        handledByLocalCommand = true;
      }
    }

    if (handledByLocalCommand) {
      setTimeout(() => {
        setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
        setLoading(false);
        inputRef.current?.focus();
      }, 500);
      return;
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
        body: JSON.stringify({ contents: geminiMessages, generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 } })
      });
      const data = await res.json();
      if (!res.ok) setMessages(m => [...m, { role: 'assistant', content: `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${res.status})` }]);
      else if (data.candidates?.[0]?.content?.parts) setMessages(m => [...m, { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }]);
      else if (data.promptFeedback?.blockReason) setMessages(m => [...m, { role: 'assistant', content: `Sua mensagem foi bloqueada: ${data.promptFeedback.blockReason}` }]);
      else setMessages(m => [...m, { role: 'assistant', content: 'Resposta inválida da API Gemini' }]);
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
            <span
              className="message-bubble"
              dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? marked.parse(m.content) : m.content }}
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
