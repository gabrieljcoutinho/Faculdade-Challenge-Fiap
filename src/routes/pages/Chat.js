import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/quickSuggestions.css';
import '../../CSS/Chat/iconeMic.css';
import '../../CSS/Chat/iconeLixeiraChat.css';
import '../../CSS/Chat/imgCentroChat.css';
import '../../CSS/Chat/mediaScreen.css';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';
import library from '../../data/library.json';

import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';
import logoGoodwe from '../../imgs/imgHeader/logo.png';
import excluir from '../../imgs/imgChat/excluir.png';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

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

// Função para detectar tipo automático de Bluetooth
const detectDeviceType = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('tv')) return 'TV';
  if (lower.includes('fone') || lower.includes('headset') || lower.includes('earbud')) return 'Fone';
  if (lower.includes('caixa') || lower.includes('speaker')) return 'Caixa';
  if (lower.includes('phone') || lower.includes('celular') || lower.includes('iphone') || lower.includes('android')) return 'Celular';
  if (lower.includes('pc') || lower.includes('notebook') || lower.includes('laptop')) return 'PC';
  if (lower.includes('watch') || lower.includes('relogio')) return 'Relogio';
  if (lower.includes('keyboard') || lower.includes('teclado')) return 'Teclado';
  if (lower.includes('mouse')) return 'Mouse';
  if (lower.includes('sensor')) return 'Sensor';
  if (lower.includes('lamp') || lower.includes('lampada')) return 'Lampada';
  return 'Outro';
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
  const [isListening, setIsListening] = useState(false);
  const [pdfContent, setPdfContent] = useState({});
  const [btDevices, setBtDevices] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const quickSuggestions = ['Conectar TV','Conectar Ar-Condicionado','Conectar Lâmpada','Conectar Geladeira','Conectar Carregador'];

  const addLog = (msg) => setBtDevices(prev => [...prev, { log: `[${new Date().toLocaleTimeString()}] ${msg}` }]);

  // Reconhecimento de voz
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => { console.error('Erro no reconhecimento de voz:', event.error); setIsListening(false); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
      handleSendMessage();
    };

    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  // Carrega PDFs
  useEffect(() => {
    const loadPdfs = async () => {
      const loadedContent = {};
      for (const doc of library.documents) {
        try {
          const loadingTask = pdfjsLib.getDocument(doc.path);
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + ' ';
          }
          loadedContent[doc.name] = fullText;
        } catch (error) { console.error(`Erro ao carregar PDF ${doc.name}:`, error); }
      }
      setPdfContent(loadedContent);
    };
    loadPdfs();
  }, []);

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

  const speakText = text => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendAssistantMessage = content => {
    setMessages(m => [...m, { role: 'assistant', content }]);
    if (speakMode || screenReaderMode) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakText(content.replace(/\*\*/g,'').replace(/\n-/g,', ')), 100);
    }
  };

  // 🔹 Função de conexão Bluetooth
  const handleBluetoothConnect = async () => {
    if (!navigator.bluetooth) { addLog('❌ Web Bluetooth não suportado.'); return; }
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ['generic_access','battery_service'] });
      const server = await device.gatt.connect();
      const name = device.name || `(desconhecido) ${device.id.slice(0,6)}`;
      const type = detectDeviceType(name);

      setBtDevices(prev => [...prev, { id: device.id, name, type, connected: true, server }]);
      addLog(`✅ Conectado a ${name} (${type})`);

      device.addEventListener('gattserverdisconnected', () => {
        addLog(`🔌 Dispositivo ${name} desconectado.`);
        setBtDevices(prev => prev.map(d => d.id === device.id ? { ...d, connected: false } : d));
      });
    } catch(err) { addLog(`Erro Bluetooth: ${err.message}`); }
  };

  const handleSendMessage = useCallback(async e => {
    e?.preventDefault();
    const texto = newMessage.trim();
    if (!texto) return;

    setNewMessage('');
    setLoading(true);
    inputRef.current?.focus();

    if (firstInteraction) setFirstInteraction(false);
    setMessages(m => [...m, { role: 'user', content: texto }]);
    const textoNormalizado = normalizeText(texto);
    let handledByLocalCommand = false;

    if (textoNormalizado.startsWith('bluetooth') || textoNormalizado.startsWith('conectar bluetooth')) {
      await handleBluetoothConnect();
      handledByLocalCommand = true;
    }

    if (!handledByLocalCommand) sendAssistantMessage('Comando processado normalmente.');
    setLoading(false);
  }, [newMessage, firstInteraction]);

  return (
    <div className={`chat-container ${isFadingOut?'fade-out':''}`}>
      <div className="message-display-area">
        {firstInteraction && (
          <div className="movimentoDaDiv">
            <div className="messageBot">
              <span className="message-bubble messagemInicial">
                💡 Digite <strong>Comandos</strong> para receber comandos específicos do site.
              </span>
            </div>
            <img src={logoGoodwe} alt="Imagem opaca" className={`chat-center-image ${messages.length>0?'hide':''}`}/>
          </div>
        )}
        {messages.filter(m=>m.role!=='system').map((m,i)=>(
          <div key={i} className={`message ${m.role==='user'?'user':'bot'}`}>
            <span className="message-bubble" dangerouslySetInnerHTML={{__html: m.role==='assistant'?DOMPurify.sanitize(marked.parse(m.content)):DOMPurify.sanitize(m.content)}}/>
          </div>
        ))}
        {loading && <div className="message bot"><span className="message-bubble">Digitando...</span></div>}
        <div ref={messagesEndRef}/>
      </div>

      <div className="quick-suggestions">
        {quickSuggestions.map((s,index)=>(<button key={index} type="button" className="suggestion-button" onClick={()=>setNewMessage(s)} title={`Clique para preencher: ${s}`}>{s}</button>))}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-with-mic">
          <input ref={inputRef} type="text" value={newMessage} onChange={e=>setNewMessage(e.target.value)} placeholder="Sua mensagem..." className="message-input" disabled={loading} autoComplete="off" title="Digite sua mensagem"/>
          <button type="button" className={`mic-button ${isListening?'listening':''}`} onClick={handleMicClick} title={isListening?'Parar escuta':'Clique para falar'}>🎤</button>
        </div>
        <button type="submit" className="send-button" disabled={loading}><img src={sendBtn} alt="Enviar" className="send-icon"/></button>
        <button type="button" className="clear-button" onClick={() => setMessages([])} title="Limpar a conversa"><img src={excluir} alt=""  className='iconeImgTrash'/></button>
      </form>
    </div>
  );
};

export default Chat;
