import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';

import comandosData from '../../data/commands.json'; // import do arquivo JSON

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const modePrompts = {
  professor: 'Você é um professor didático e paciente. Explique conceitos com clareza, usando exemplos práticos simples, de forma que até iniciantes compreendam. Seja sempre gentil e objetivo.',
  profissional: 'Você é um assistente profissional e técnico. Forneça respostas detalhadas, precisas e formais, utilizando termos técnicos quando apropriado. Seja claro e direto.',
  engracado: 'Você é engraçado e descontraído. Responda de forma leve e divertida, usando humor e analogias engraçadas para facilitar o entendimento.',
  coaching: 'Você é um coach motivador. Inspire o usuário com respostas positivas, motivacionais e encorajadoras, ajudando-o a superar dúvidas com confiança.',
  calmo: 'Você é calmo e reflexivo. Responda com tranquilidade, promovendo reflexão e clareza, usando linguagem serena e acolhedora.'
};

const normalizeText = (text) => text.trim().toLowerCase();

const Chat = () => {
  const [mode, setMode] = useState('profissional');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const texto = newMessage.trim();
    if (!texto) return;

    // Normaliza texto para comparação
    const textoNormalizado = normalizeText(texto);

    // Verificar se a mensagem é um comando predefinido (case insensitive)
    const comandoEncontrado = comandosData.comandos.find(cmd => normalizeText(cmd.trigger) === textoNormalizado);

    if (comandoEncontrado) {
      let resposta = comandoEncontrado.resposta;

      // Exemplo de comando com resposta dinâmica
      if (comandoEncontrado.trigger.toLowerCase() === '/horario') {
        const agora = new Date();
        resposta += ' ' + agora.toLocaleTimeString();
      }

      // Adiciona a mensagem do usuário e a resposta do assistente
      setMessages(prev => [
        ...prev,
        { role: 'user', content: texto },
        { role: 'assistant', content: resposta }
      ]);

      setNewMessage('');
      return; // Para aqui, não chama a API Gemini
    }

    // Se não for comando, enviar mensagem para API Gemini
    const userMessage = { role: 'user', content: texto };
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
        setMessages(prev => [...prev, { role: 'assistant', content: `Erro na API Gemini: ${errorData.error?.message || 'Problema desconhecido'} (Código: ${response.status})` }]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }]);
      } else if (data.promptFeedback?.blockReason) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Sua mensagem foi bloqueada devido a políticas de segurança: ${data.promptFeedback.blockReason}` }]);
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
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user' : 'bot'}`}
          >
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
