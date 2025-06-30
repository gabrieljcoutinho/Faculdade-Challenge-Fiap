import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';
import comandosData from '../../data/commands.json'; // Ensure the path to commands.json is correct

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Helper function to normalize text (remove spaces and convert to lowercase)
const normalizeText = (text) => text.trim().toLowerCase();

const Chat = ({ onConnectDevice, productionData, setTheme }) => {
    // Component states
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [firstInteraction, setFirstInteraction] = useState(true);

    // Ref for automatically scrolling the message area
    const messagesEndRef = useRef(null);

    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Effect to scroll to the latest message whenever messages are updated
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Formats solar production data into a readable string (Markdown table).
     * @param {object} data - Object containing labels (hours) and datasets (production values).
     * @returns {string} - Formatted string with production data.
     */
    const formatProductionData = (data) => {
        if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
            return "Não há dados de produção solar disponíveis no momento.";
        }

        const labels = data.labels;
        const productionValues = data.datasets[0].data;
        let response = "Produção de energia solar:\n\n";
        response += "| Hora | Produção (kW/h) |\n";
        response += "|------|------------------|\n";

        let totalProduction = 0;
        for (let i = 0; i < labels.length; i++) {
            const hour = labels[i];
            const value = productionValues[i];
            response += `| ${hour} | ${value} kW/h |\n`;
            totalProduction += value;
        }

        response += `\nProdução total registrada: ${totalProduction} kWh.`;
        return response;
    };

    /**
     * Handles sending user messages.
     * Checks local commands, integrates with the Gemini API, and manages state.
     * @param {Event} e - Form event.
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const texto = newMessage.trim();
        if (!texto) return;

        // Marks that there's been a first interaction
        if (firstInteraction) setFirstInteraction(false);

        const textoNormalizado = normalizeText(texto);
        setMessages(prev => [...prev, { role: 'user', content: texto }]);
        setNewMessage('');
        setLoading(true);

        let handledByLocalCommand = false;
        let botResponseContent = '';

        // Device connection commands
        const connectionCommands = [
            { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão', 'oconectar tv', 'oconectar televisão'] },
            { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado', 'oconectar ar-condicionado', 'oconectar ar condicionado'] },
            { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada', 'oconectar lâmpada', 'oconectar lampada'] },
            { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry', 'oconectar airfry'] },
            { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador', 'oconectar carregador'] }
        ];

        let identifiedDeviceType = null;
        let fullDeviceNameForConnection = null;

        // Check if the message corresponds to a connection command
        for (const cmd of connectionCommands) {
            for (const trigger of cmd.triggers) {
                const normalizedTrigger = normalizeText(trigger);
                if (textoNormalizado.startsWith(normalizedTrigger)) {
                    identifiedDeviceType = cmd.type;
                    let remainingText = texto.substring(trigger.length).trim();
                    fullDeviceNameForConnection = remainingText
                        ? `${cmd.type} ${remainingText.charAt(0).toUpperCase() + remainingText.slice(1)}`
                        : cmd.type;

                    // Call the function to connect the device (passed via prop)
                    if (typeof onConnectDevice === 'function') {
                        onConnectDevice(identifiedDeviceType, fullDeviceNameForConnection);
                    }

                    // Redirect to the connections page automatically
                    navigate('/conexoes');

                    // Define the bot's response message
                    botResponseContent = `${fullDeviceNameForConnection} conectado!`;
                    handledByLocalCommand = true;
                    break;
                }
            }
            if (handledByLocalCommand) break;
        }

        // If it wasn't a connection command, check other local commands from commands.json
        if (!handledByLocalCommand) {
            const comandoEncontrado = comandosData.comandos.find(cmd =>
                Array.isArray(cmd.triggers) && cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
            );

            if (comandoEncontrado) {
                // Handle redirects
                if (comandoEncontrado.resposta.startsWith("REDIRECT:")) {
                    const path = comandoEncontrado.resposta.split(":")[1];
                    navigate(path);
                    setLoading(false);
                    return; // Exit the function after redirecting
                }

                // Handle chart production response
                botResponseContent =
                    comandoEncontrado.resposta === 'PRODUCAO_GRAFICO'
                        ? formatProductionData(productionData) // <-- Using productionData directly here
                        : comandoEncontrado.resposta;

                // Handle theme change
                if (botResponseContent === 'TEMA_ESCURO') {
                    document.body.classList.remove('light-theme');
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('theme', 'dark-theme');
                    if (setTheme) setTheme('dark-theme');
                    botResponseContent = "Tema escuro ativado! 🌙";
                }

                if (botResponseContent === 'TEMA_CLARO') {
                    document.body.classList.remove('dark-theme');
                    document.body.classList.add('light-theme');
                    localStorage.setItem('theme', 'light-theme');
                    if (setTheme) setTheme('light-theme');
                    botResponseContent = "Tema claro ativado! ☀️";
                }

                handledByLocalCommand = true;
            }
        }

        // If a local command was handled, display the response and finish
        if (handledByLocalCommand) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
                setLoading(false);
            }, 500); // Small delay to simulate the bot "typing"
            return;
        }

        // If no Gemini API key is configured
        if (!GEMINI_API_KEY) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
            setLoading(false);
            return;
        }

        // If no local command was handled, send to the Gemini API
        try {
            // Prepare messages for the Gemini API, including the initial model message
            const geminiMessages = [
                { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
                ...messages.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                { role: 'user', parts: [{ text: texto }] }
            ];

            const payload = {
                contents: geminiMessages,
                generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 }
            };

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            // Handle API errors
            if (!response.ok) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${response.status})` }
                ]);
                return;
            }

            // Process the Gemini API response
            if (data.candidates?.[0]?.content?.parts) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }
                ]);
            } else if (data.promptFeedback?.blockReason) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: `Sua mensagem foi bloqueada: ${data.promptFeedback.blockReason}` }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: 'Resposta inválida da API Gemini' }
                ]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
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

                {/* Renders chat messages */}
                {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                    <div key={index} className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
                        <span
                            className="message-bubble"
                            // Uses marked.parse to render Markdown in the assistant's response
                            dangerouslySetInnerHTML={{
                                __html: message.role === 'assistant'
                                    ? marked.parse(message.content)
                                    : message.content
                            }}
                        />
                    </div>
                ))}

                {/* "Typing..." indicator */}
                {loading && (
                    <div className="message bot">
                        <span className="message-bubble">Digitando...</span>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Scroll point */}
            </div>

            {/* Message input form */}
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Sua mensagem..."
                    className="message-input"
                    disabled={loading} // Disables the input while the bot is responding
                    autoComplete="off"
                    title='Diigite seu texto ou sua mensagem'
                />
                <button type="submit" className="send-button" disabled={loading}>
                    <img src={sendBtn} alt="Enviar" className="send-icon"  title='Enviar Texto ou Mensagem'/>
                </button>
            </form>
        </div>
    );
};

export default Chat;