import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const modePrompts = {
  professor: 'Você é um professor didático e paciente. Explique conceitos com clareza, usando exemplos práticos simples, de forma que até iniciantes compreendam. Seja sempre gentil e objetivo.',
  profissional: 'Você é um assistente profissional e técnico. Forneça respostas detalhadas, precisas e formais, utilizando termos técnicos quando apropriado. Seja claro e direto.',
  engracado: 'Você é engraçado e descontraído. Responda de forma leve e divertida, usando humor e analogias engraçadas para facilitar o entendimento.',
  coaching: 'Você é um coach motivador. Inspire o usuário com respostas positivas, motivacionais e encorajadoras, ajudando-o a superar dúvidas com confiança.',
  calmo: 'Você é calmo e reflexivo. Responda com tranquilidade, promovendo reflexão e clareza, usando linguagem serena e acolhedora.'
};

const Chat = () => {
  const [mode, setMode] = useState('professor');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const validRoutes = {
      Home: '/',
      Inicio: '/',
      Conexoes: '/conexoes',
      Conexões: '/conexoes',
      Contato: '/contato',
      Contatos: '/contato',
      Configuracoes: '/configuracoes',
      Configuracao: '/configuracoes',
      Configurações: '/configuracoes',
      Configuração: '/configuracoes',
      Configuracões: '/configuracoes',
      Configuracão: '/configuracoes',
      Login: '/login',
      Logar: '/login',
      Cadastro: '/cadastro',
      Cadastros: '/cadastro',
      Cadastrar: '/cadastro',
    };

    const routeKey = newMessage.trim();
    const isRouteCommand = /^[A-Z][a-z]+$/.test(routeKey) && validRoutes[routeKey];
    if (isRouteCommand) {
      navigate(validRoutes[routeKey]);
      return;
    }

    // --- NEW LOGIC FOR DEVICE CONNECTION COMMANDS ---
    const connectionCommandMatch = newMessage.trim().match(/^Conectar\s(.+)$/i);
    if (connectionCommandMatch) {
      const deviceName = connectionCommandMatch[1].trim();
      const lowerCaseDeviceName = deviceName.toLowerCase();

      // Retrieve existing connections from local storage
      let existingConexions = JSON.parse(localStorage.getItem('conexions')) || [];

      const availableIconsMap = {
        tv: '/static/media/TV.3d3284bb35830953a9e4.png', // Update with actual paths from Conexoes.jsx
        'ar-condicionado': '/static/media/ar-condicionado.c035f5287f3b8908d13a.png',
        lampada: '/static/media/lampada.d1edecf7c32b50772f91.png',
        airfry: '/static/media/airfry.05047466d3a5105771c9.png',
        carregador: '/static/media/carregador.5f02c63c76044737a28e.png'
      };

      const availableDeviceNames = Object.keys(availableIconsMap);

      if (availableDeviceNames.includes(lowerCaseDeviceName)) {
        const deviceIcon = availableIconsMap[lowerCaseDeviceName];
        const newDevice = {
          text: deviceName.charAt(0).toUpperCase() + deviceName.slice(1), // Capitalize first letter
          icon: deviceIcon,
          backgroundColor: '#FFEBCD', // Default color, can be customized
          connected: true
        };

        // Check if the device already exists to avoid duplicates or update it
        const deviceExistsIndex = existingConexions.findIndex(c => c.text.toLowerCase() === lowerCaseDeviceName);

        if (deviceExistsIndex > -1) {
          // Update existing device to connected if it exists
          existingConexions[deviceExistsIndex] = { ...existingConexions[deviceExistsIndex], connected: true };
          setMessages(prev => [...prev, { role: 'assistant', content: `O aparelho "${newDevice.text}" já estava presente e foi conectado!` }]);
        } else {
          // Add new device
          existingConexions.push(newDevice);
          setMessages(prev => [...prev, { role: 'assistant', content: `Aparelho "${newDevice.text}" conectado com sucesso!` }]);
        }

        localStorage.setItem('conexions', JSON.stringify(existingConexions));
        setNewMessage('');
        return; // Stop further processing as it's a device command
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Desculpe, não consegui identificar o aparelho "${deviceName}". Os aparelhos disponíveis para conexão são: TV, Ar-Condicionado, Lâmpada, Airfry e Carregador.` }]);
        setNewMessage('');
        return;
      }
    }
    // --- END NEW LOGIC ---

    const userMessage = { role: 'user', content: newMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setLoading(true);

    if (!GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
      setLoading(false);
      return;
    }

    try {
      const geminiMessages = [
        { role: 'user', parts: [{ text: modePrompts[mode] }] },
        { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
        ...updatedMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Erro na API Gemini: ${errorData.error?.message || 'Problema desconhecido'} (Código: ${response.status})`
        }]);
        return;
      }

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text.trim()
        }]);
      } else if (data.promptFeedback?.blockReason) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sua mensagem foi bloqueada devido a políticas de segurança: ${data.promptFeedback.blockReason}`
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Resposta inválida da API Gemini' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="mode-selector-container">
        <label htmlFor="mode-select">Modo de resposta</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={loading}
        >
          {Object.entries({
            professor: 'Professor (didático)',
            profissional: 'Profissional / Técnico',
            engracado: 'Engraçado / Descontraído',
            coaching: 'Coaching / Motivador',
            calmo: 'Calmo / Reflexivo'
          }).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="message-display-area">
        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
          <div key={index} className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
            <span className="message-bubble">{message.content}</span>
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
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Sua mensagem..."
          className="message-input"
          disabled={loading}
        />
        <button type="submit" className="send-button" disabled={loading}>
          <img src={sendBtn} alt="Enviar" className="send-icon" />
        </button>
      </form>
    </div>
  );
};

export default Chat;