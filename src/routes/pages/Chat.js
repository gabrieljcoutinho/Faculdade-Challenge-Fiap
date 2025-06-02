import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';

import sendBtn from '../../imgs/sendBtn.png';

// Apenas a chave da API do Gemini é necessária
// Certifique-se de que no seu arquivo .env (ou .env.local) na raiz do projeto, você tem:
// REACT_APP_GEMINI_API_KEY=sua_chave_gemini_aqui
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Log para verificar se a chave está sendo carregada corretamente
console.log('Chave da API Gemini carregada (primeiros 5 caracteres):', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' : 'Não carregada');

// Prompts para diferentes modos de resposta do chat
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
  // Estado para o modo de resposta do chat (professor, profissional, etc.)
  const [mode, setMode] = useState('professor');
  // Estado para armazenar as mensagens do chat (usuário e bot)
  const [messages, setMessages] = useState([]);
  // Estado para a nova mensagem que o usuário está digitando
  const [newMessage, setNewMessage] = useState('');
  // Estado para indicar se o chat está carregando uma resposta
  const [loading, setLoading] = useState(false);
  // Referência para o final da área de mensagens, usada para rolagem automática
  const messagesEndRef = useRef(null);

  // Efeito para rolar automaticamente para o final das mensagens quando elas são atualizadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Depende apenas das mensagens, já que não há imagem gerada

  // Função para rolar a área de mensagens para o final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // O useEffect que adicionava a mensagem de sistema foi removido,
  // pois o prompt do sistema é enviado diretamente na requisição ao Gemini.

  // Função principal para enviar mensagens e obter respostas do Gemini
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)

    console.log('handleSendMessage foi chamado!');

    // Se a mensagem estiver vazia ou contiver apenas espaços, não faz nada
    if (!newMessage.trim()) return;

    // Cria um objeto para a mensagem do usuário
    const userMessage = { role: 'user', content: newMessage };
    // Adiciona a nova mensagem do usuário ao histórico existente
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Atualiza o estado para exibir a mensagem do usuário
    setNewMessage(''); // Limpa o campo de entrada
    setLoading(true); // Ativa o estado de carregamento

    // --- Fluxo de comunicação com a API do Gemini ---
    // Verifica se a chave da API do Gemini está configurada
    if (!GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada. Verifique seu arquivo .env ou .env.local.' },
      ]);
      console.error('GEMINI_API_KEY não está definida. Verifique seu .env ou .env.local e reinicie o servidor.');
      setLoading(false);
      return; // Sai da função se a chave não estiver disponível
    }

    try {
      // Prepara o histórico de mensagens para a API do Gemini
      // O Gemini espera uma alternância de turnos 'user' e 'model'.
      // O prompt do sistema é adicionado como a primeira "fala" do usuário.
      const geminiMessages = [];

      // Adiciona o prompt do modo selecionado como a primeira instrução para o Gemini
      geminiMessages.push({
        role: 'user',
        parts: [{ text: modePrompts[mode] }],
      });
      // Adiciona uma resposta "vazia" ou genérica do modelo para "fechar" o turno inicial do sistema/usuário.
      // Isso é crucial para manter a alternância de turnos que o Gemini espera.
      geminiMessages.push({
        role: 'model',
        parts: [{ text: "Ok, entendi. Como posso ajudar?" }],
      });

      // Adiciona as mensagens reais do histórico do chat, mapeando os papéis
      // 'user' (seu estado) para 'user' (Gemini)
      // 'assistant' (seu estado) para 'model' (Gemini)
      updatedMessages.forEach(msg => {
        if (msg.role === 'user') {
          geminiMessages.push({
            role: 'user',
            parts: [{ text: msg.content }],
          });
        } else if (msg.role === 'assistant') {
          geminiMessages.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      });

      // Realiza a chamada à API do Gemini
      // ATENÇÃO: O MODELO FOI ALTERADO DE 'gemini-pro' PARA 'gemini-2.0-flash'
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages, // Envia o histórico de mensagens formatado
          generationConfig: {
            temperature: 0.9, // Controla a aleatoriedade da resposta (0.0 a 1.0)
            topP: 0.8,      // Controla a diversidade de palavras (0.0 a 1.0)
            maxOutputTokens: 1000, // Limite de tokens na resposta
          },
          // safetySettings: [ ... ], // Configurações de segurança opcionais
        }),
      });

      // Verifica se a resposta HTTP foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json(); // Tenta parsear o JSON do erro
        console.error('Erro na resposta da API Gemini (HTTP):', response.status, response.statusText, errorData);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Erro na API Gemini: ${errorData.error ? errorData.error.message : 'Problema desconhecido na API Gemini.'} (Código: ${response.status})` },
        ]);
        setLoading(false);
        return; // Sai da função após o erro
      }

      // Processa a resposta da API do Gemini
      const data = await response.json();
      console.log('Resposta da API Gemini:', data); // Log da resposta completa da API

      // Verifica se a resposta contém o conteúdo esperado
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        const botReply = data.candidates[0].content.parts[0].text;
        const botMessage = {
          role: 'assistant',
          content: botReply.trim(),
        };
        setMessages((prev) => [...prev, botMessage]); // Adiciona a resposta do bot ao chat
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        // Se a mensagem foi bloqueada pelas políticas de segurança do Gemini
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Sua mensagem foi bloqueada devido a políticas de segurança do Gemini: ${data.promptFeedback.blockReason}. Por favor, tente reformular.` },
        ]);
      } else {
        // Caso a API responda OK, mas sem uma resposta válida (situação incomum)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'A API Gemini respondeu, mas sem uma resposta de chat válida. Tente novamente.' },
        ]);
      }
    } catch (error) {
      // Captura erros de rede ou outros problemas na chamada da API
      console.error('Erro de rede/chamada da API Gemini:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro na API Gemini: ${error.message}. Verifique sua conexão ou console para mais detalhes.` },
      ]);
    } finally {
      setLoading(false); // Desativa o estado de carregamento, independentemente do sucesso ou falha
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
          <option value="professor">Professor (didático)</option>
          <option value="profissional">Profissional / Técnico</option>
          <option value="engracado">Engraçado / Descontraído</option>
          <option value="coaching">Coaching / Motivador</option>
          <option value="calmo">Calmo / Reflexivo</option>
        </select>
      </div>

      <div className="message-display-area">
        {messages
          // Filtra mensagens com role 'system' para não as exibir no chat,
          // pois elas são usadas apenas para instruir o modelo.
          .filter((msg) => msg.role !== 'system')
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
        {/* A seção de imagem gerada foi removida, pois não estamos usando DALL-E */}
        <div ref={messagesEndRef} /> {/* Elemento para rolagem automática */}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Sua mensagem..."
          className="message-input"
          disabled={loading} // Desabilita o input enquanto carrega
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
