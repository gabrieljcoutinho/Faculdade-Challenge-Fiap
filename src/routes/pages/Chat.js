import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css'
import '../../CSS/Chat/send.css'

import sendBtn from '../../imgs/sendBtn.png';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;


const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage = { text: newMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      // Monta o corpo da requisição para a API OpenAI Chat Completion
      const body = {
        model: "gpt-4o-mini",  // ou "gpt-3.5-turbo"
        messages: [
          // Passa todo o histórico para manter o contexto
          ...messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: "user", content: newMessage }
        ],
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const botMessageText = data.choices[0].message.content.trim();
        const botMessage = { text: botMessageText, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setMessages(prev => [...prev, { text: "Erro: resposta vazia da API.", sender: 'bot' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: `Erro na API: ${error.message}`, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="message-display-area">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            <span className="message-bubble">{message.text}</span>
          </div>
        ))}
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
          <img src={sendBtn} alt="Send" className="send-icon" />
        </button>
      </form>
      <br /><br /><br /><br />
    </div>

  );
};

export default Chat;
