import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';

import sendBtn from '../../imgs/sendBtn.png';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const modePrompts = {
  professor:
    'Você é um professor didático e paciente. Explique conceitos com clareza, usando exemplos práticos simples, de forma que até iniciantes compreendam. Seja sempre gentil e objetivo.',
  profissional:
    'Você é um assistente profissional e técnico. Forneça respostas detalhadas, precisas e formais, utilizando termos técnicos quando apropriado. Seja claro e direto.',
  engracado:
    'Você é engraçado e descontraído. Responda de forma leve e divertida, usando humor e analogias engraçadas para facilitar o entendimento.',
  coaching:
    'Você é um coach motivador. Inspire o usuário com respostas positivas, motivacionais e encorajadoras, ajudando-o a superar dúvidas com confiança.',
  calmo:
    'Você é calmo e reflexivo. Responda com tranquilidade, promovendo reflexão e clareza, usando linguagem serena e acolhedora.',
};

const Chat = () => {
  const [mode, setMode] = useState('professor');
  const [messages, setMessages] = useState([]); // Começa vazio, o prompt do sistema será adicionado no useEffect
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efeito para rolar para o final das mensagens sempre que elas são atualizadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- ALTERAÇÃO PRINCIPAL AQUI ---
  // Este useEffect agora gerencia a mensagem do sistema sem apagar o histórico.
  useEffect(() => {
    setMessages(prevMessages => {
      // Encontra o índice da mensagem do sistema, se ela já existir
      const systemMessageIndex = prevMessages.findIndex(msg => msg.role === 'system');

      const newSystemMessage = { role: 'system', content: modePrompts[mode] };

      if (systemMessageIndex !== -1) {
        // Se a mensagem do sistema já existe, atualiza o conteúdo dela
        const updatedMessages = [...prevMessages];
        updatedMessages[systemMessageIndex] = newSystemMessage;
        return updatedMessages;
      } else {
        // Se não existir, adiciona a nova mensagem do sistema no início do array
        return [newSystemMessage, ...prevMessages];
      }
    });
  }, [mode]);
  // --- FIM DA ALTERAÇÃO PRINCIPAL ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { role: 'user', content: newMessage };
    // Adiciona a nova mensagem do usuário ao histórico existente
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Atualiza o estado para exibir a mensagem do usuário
    setNewMessage('');
    setLoading(true);

    try {
      const body = {
        model: 'gpt-4o-mini',
        messages: updatedMessages, // Envia todo o histórico (incluindo o prompt do sistema)
        temperature: 1.0, // Aumentado para encorajar mais criatividade/variedade
        top_p: 1.0,      // Aumentado para permitir mais diversidade de palavras
        max_tokens: 1000,
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const botReply = data.choices[0].message;
        const botMessage = {
          role: 'assistant',
          content: botReply.content.trim(),
        };
        setMessages((prev) => [...prev, botMessage]); // Adiciona a resposta do bot
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erro: resposta vazia da API.' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro na API: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Seletor de modo */}
      <div className="mode-selector-container">
        <label htmlFor="mode-select">Modo de resposta</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={loading}
        >
          <option value="professor">Professor (didático)</option>
          <option value="profissional">Profissional / Técnico</option>
          <option value="engracado">Engraçado / Descontraído</option>
          <option value="coaching">Coaching / Motivador</option>
          <option value="calmo">Calmo / Reflexivo</option>
        </select>
      </div>

      {/* Área das mensagens */}
      <div className="message-display-area">
        {messages
          .filter((msg) => msg.role !== 'system') // Não exibe a mensagem do sistema na UI
          .map((message, index) => (
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

      {/* Formulário de envio */}
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

      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default Chat;