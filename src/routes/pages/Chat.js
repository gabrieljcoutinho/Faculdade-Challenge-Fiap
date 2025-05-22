import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';

import sendBtn from '../../imgs/sendBtn.png'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  // Cria uma referência para o elemento onde as mensagens serão exibidas.
  const messagesEndRef = useRef(null);

  // Função para enviar uma nova mensagem.
  const handleSendMessage = (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página).
    if (newMessage.trim()) { // Garante que a mensagem não está vazia ou apenas com espaços.
      // Adiciona a nova mensagem ao estado 'messages'.
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      setNewMessage(''); // Limpa o campo de entrada após o envio.
    }
  };

  // Função auxiliar para rolar a área de mensagens para o final.
  const scrollToBottom = () => {
    // Verifica se a referência existe e, em seguida, rola para a visualização.
    // 'behavior: "smooth"' proporciona uma rolagem suave.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // O hook useEffect é executado após cada renderização do componente.
  // Ele é configurado para ser executado toda vez que o array 'messages' muda.
  useEffect(() => {
    scrollToBottom(); // Chama a função para rolar para o final.
  }, [messages]); // A dependência '[messages]' faz com que este efeito seja disparado quando 'messages' é atualizado.

  return (
    <div className="chat-container">
      <br /><br />      <br /><br />

      <div className="message-display-area">
        {messages.map((message, index) => (
          <div
            key={index} // 'key' é importante para a performance e identificação de elementos em listas no React.
            className={`message ${message.sender === 'user' ? 'user' : 'other'}`}
          >
            <span className="message-bubble">
              {message.text}
            </span>
          </div>
        ))}
        {/* Este div vazio é o "âncora" para onde vamos rolar. */}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)} // Atualiza o estado 'newMessage' conforme o usuário digita.
          placeholder="Sua menssagem..."
          className="message-input"
        />
       <button type="submit" className="send-button">
  <img src={sendBtn} alt="Send" className="send-icon" />
</button>

      </form>
    </div>
  );
};

export default Chat;