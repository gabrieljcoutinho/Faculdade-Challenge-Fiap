import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';

import sendBtn from '../../imgs/sendBtn.png';

// Certifique-se de que OPENAI_API_KEY está disponível no seu ambiente
// Ex: no seu arquivo .env.local ou .env, deve ter: REACT_APP_OPENAI_API_KEY=sua_chave_aqui
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Log para verificar se a chave está sendo carregada corretamente
console.log('Chave da API carregada (primeiros 5 caracteres):', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 5) + '...' : 'Não carregada');

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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [generatedImage, setGeneratedImage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generatedImage]);

  useEffect(() => {
    setMessages(prevMessages => {
      const systemMessageIndex = prevMessages.findIndex(msg => msg.role === 'system');
      const newSystemMessage = { role: 'system', content: modePrompts[mode] };

      if (systemMessageIndex !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[systemMessageIndex] = newSystemMessage;
        return updatedMessages;
      } else {
        return [newSystemMessage, ...prevMessages];
      }
    });
  }, [mode]);


















const handleSendMessage = async (e) => {
    e.preventDefault();

    // ADIÇÃO: Log para verificar se a função foi chamada
    console.log('handleSendMessage foi chamado!');

    if (!newMessage.trim()) return;

    // Verifica se a chave da API está carregada antes de prosseguir
    if (!OPENAI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro: Chave da API OpenAI não configurada. Verifique seu arquivo .env.local.' },
      ]);
      console.error('OPENAI_API_KEY não está definida. Verifique seu .env.local e reinicie o servidor.'); // ADIÇÃO: Log de erro no console
      return;
    }

    const userMessage = { role: 'user', content: newMessage };
    // Adiciona a nova mensagem do usuário ao histórico existente
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Atualiza o estado para exibir a mensagem do usuário
    setNewMessage('');
    setLoading(true);
    setGeneratedImage(null); // Limpa qualquer imagem anterior ao enviar nova mensagem

    // --- Lógica para Geração de Imagem ---
    if (newMessage.toLowerCase().startsWith('!imagem ')) {
      const promptImagem = newMessage.substring('!imagem '.length).trim();
      if (promptImagem) {
        try {
          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              prompt: promptImagem,
              n: 1, // Número de imagens a serem geradas
              size: '512x512', // Tamanho da imagem: '256x256', '512x512', ou '1024x1024'
              // model: 'dall-e-2', // Você pode especificar o modelo aqui, se desejar (dall-e-3 é mais avançado)
            }),
          });

          // ADIÇÃO: Verificação de resposta HTTP OK para a API de imagem
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na resposta da API de imagem (HTTP):', response.status, response.statusText, errorData);
            setMessages(prev => [...prev, { role: 'assistant', content: `Erro ao gerar imagem: ${errorData.error ? errorData.error.message : 'Problema desconhecido na API de imagem.'}` }]);
            setLoading(false); // Certifique-se de parar o loading aqui
            return; // Sai da função após o erro
          }

          const data = await response.json();
          console.log('Resposta da API de imagem:', data); // Log da resposta completa

          if (data.data && data.data.length > 0 && data.data[0].url) {
            setGeneratedImage(data.data[0].url); // Armazena a URL da imagem
            // Opcional: Adicionar uma mensagem de texto no chat sobre a imagem
            setMessages(prev => [...prev, { role: 'assistant', content: 'Aqui está a imagem que você pediu:' }]);
          } else if (data.error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Erro ao gerar imagem: ${data.error.message}` }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Não foi possível gerar a imagem. A resposta da API não continha uma URL válida.' }]);
          }
        } catch (error) {
          console.error('Erro de rede/chamada da API de imagem:', error);
          setMessages(prev => [...prev, { role: 'assistant', content: `Erro na API de imagem: ${error.message}. Verifique sua conexão ou console para mais detalhes.` }]);
        } finally {
          setLoading(false);
        }
        return; // Sai da função para não chamar a API de chat
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Por favor, forneça um prompt para a imagem após "!imagem ".' }]);
        setLoading(false);
        return;
      }
    }
    // --- Fim da Lógica para Geração de Imagem ---

    // --- Fluxo normal do Chat ---
    try {
      const messagesForApi = updatedMessages.filter(msg => msg.role !== 'system'); // Filtra a mensagem do sistema para a API
      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: modePrompts[mode] }, // Inclui o prompt do sistema no início para a API
          ...messagesForApi // Adiciona o resto do histórico
        ],
        temperature: 1.0, // Aumentado para encorajar mais criatividade/variedade
        top_p: 1.0,       // Aumentado para permitir mais diversidade de palavras
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

      // ADIÇÃO: Verificação de resposta HTTP OK para a API de chat
      if (!response.ok) {
        const errorData = await response.json(); // Tenta parsear o JSON do erro
        console.error('Erro na resposta da API de chat (HTTP):', response.status, response.statusText, errorData);
        // Exibe a mensagem de erro da API ou uma genérica
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Erro na API: ${errorData.error ? errorData.error.message : 'Problema desconhecido na API.'} (Código: ${response.status})` },
        ]);
        setLoading(false); // Certifique-se de parar o loading aqui
        return; // Sai da função após o erro
      }

      const data = await response.json();
      console.log('Resposta da API de chat:', data); // Log da resposta completa da API

      if (data.choices && data.choices.length > 0) {
        const botReply = data.choices[0].message;
        const botMessage = {
          role: 'assistant',
          content: botReply.content.trim(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Agora este 'else' significa que a API respondeu OK (status 200),
        // mas não retornou 'choices' ou ele estava vazio, o que é incomum para sucesso.
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'A API respondeu, mas sem uma resposta de chat válida. Tente novamente.' },
        ]);
      }
    } catch (error) {
      console.error('Erro de rede/chamada da API de chat:', error); // Log para erros de rede ou CORS
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro na API: ${error.message}. Verifique sua conexão ou console para mais detalhes.` },
      ]);
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
          <option value="professor">Professor (didático)</option>
          <option value="profissional">Profissional / Técnico</option>
          <option value="engracado">Engraçado / Descontraído</option>
          <option value="coaching">Coaching / Motivador</option>
          <option value="calmo">Calmo / Reflexivo</option>
        </select>
      </div>

      <div className="message-display-area">
        {messages
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
        {generatedImage && (
          <div className="message bot image-message">
            <img src={generatedImage} alt="Imagem gerada por IA" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
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

      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default Chat;