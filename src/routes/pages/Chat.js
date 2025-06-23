import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';

import comandosData from '../../data/commands.json';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const normalizeText = (text) => text.trim().toLowerCase();

const Chat = ({ onConnectDevice, productionData }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [firstInteraction, setFirstInteraction] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatProductionData = (data) => {
        if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
            return "Não há dados de produção solar disponíveis no momento.";
        }

        const labels = data.labels;
        const productionValues = data.datasets[0].data;
        let response = "Produção de energia solar:\n\n";
        response += "| Hora | Produção (k/Wh) |\n";
        response += "|------|----------------|\n";

        let totalProduction = 0;
        for (let i = 0; i < labels.length; i++) {
            const hour = labels[i];
            const value = productionValues[i];
            response += `| ${hour} | ${value} kW/h      |\n`;
            totalProduction += value;
        }

        response += `\nProdução total registrada: ${totalProduction} kWh.`;
        return response;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const texto = newMessage.trim();
        if (!texto) return;

        if (firstInteraction) setFirstInteraction(false);

        const textoNormalizado = normalizeText(texto);

        setMessages(prev => [...prev, { role: 'user', content: texto }]);
        setNewMessage('');
        setLoading(true);

        let handledByLocalCommand = false;
        let botResponseContent = '';



        // ATENÇÃO: Adicionado 'o conectar' aos triggers
        const connectionCommands = [
            { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão', 'oconectar tv', 'oconectar televisão'] },
            { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado', 'oconectar ar-condicionado', 'oconectar ar condicionado'] },
            { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada', 'oconectar lâmpada', 'oconectar lampada'] },
            { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry', 'oconectar airfry'] },
            { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador', 'oconectar carregador'] }
        ];

        let identifiedDeviceType = null; // Ex: 'TV'
        let fullDeviceNameForConnection = null; // Ex: 'TV Sala', 'Lâmpada do Quarto'

        for (const cmd of connectionCommands) {
            for (const trigger of cmd.triggers) {
                const normalizedTrigger = normalizeText(trigger);
                if (textoNormalizado.startsWith(normalizedTrigger)) {
                    identifiedDeviceType = cmd.type; // Captura o tipo base do aparelho (ex: 'TV')
                    let remainingText = texto.substring(trigger.length).trim(); // Captura o resto da string (ex: "sala")

                    if (remainingText === '') {
                        // Se não houver nome customizado, usa o tipo base como nome final
                        fullDeviceNameForConnection = cmd.type;
                    } else {
                        // Concatena o tipo base com o restante do texto (capitalizando a primeira letra do restante)
                        // Ex: "TV" + " Sala" = "TV Sala"
                        fullDeviceNameForConnection = `${cmd.type} ${remainingText.charAt(0).toUpperCase() + remainingText.slice(1)}`;
                    }
                    handledByLocalCommand = true;
                    break; // Encontrou um trigger, para de procurar por outros para este comando
                }
            }
            if (identifiedDeviceType) break; // Encontrou um tipo de aparelho, para de procurar em connectionCommands
        }

        if (fullDeviceNameForConnection) { // Se um comando de conexão foi identificado
            if (typeof onConnectDevice === 'function') {
                // Chama a função onConnectDevice do componente pai (App.js)
                // Passa o tipo do aparelho (para talvez escolher o ícone) e o nome completo
                onConnectDevice(identifiedDeviceType, fullDeviceNameForConnection);
            }

            // Define a resposta do bot para o comando de conexão
            // Busca a resposta no comandos.json, se não encontrar, usa uma genérica
            const connectionCommandInJson = comandosData.comandos.find(cmd =>
                cmd.triggers.some(jsonTrigger => normalizeText(jsonTrigger) === textoNormalizado)
            );

            botResponseContent = connectionCommandInJson
                ? connectionCommandInJson.resposta
                : `${fullDeviceNameForConnection} conectado!`;

            handledByLocalCommand = true;
        } else { // Se não foi um comando de conexão, tenta comandos gerais ou Gemini
            const comandoEncontrado = comandosData.comandos.find(cmd =>
                cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
            );

            if (comandoEncontrado) {
                botResponseContent =
                    comandoEncontrado.resposta === 'PRODUCAO_GRAFICO'
                        ? formatProductionData(productionData)
                        : comandoEncontrado.resposta;
                handledByLocalCommand = true;
            }
        }

        if (handledByLocalCommand) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
                setLoading(false);
            }, 500);
            return;
        }

        if (!GEMINI_API_KEY) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
            setLoading(false);
            return;
        }

        try {
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

            if (!response.ok) {
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${response.status})` }
                ]);
                return;
            }

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
                        <span className="message-bubble">
                            💡 Digite <strong>Comandos</strong> para receber comandos específicos do site.
                        </span>
                    </div>
                   </div>
                )}

                {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'user' : 'bot'}`}
                    >
                        <span
                            className="message-bubble"
                            dangerouslySetInnerHTML={{
                                __html: message.role === 'assistant'
                                    ? marked.parse(message.content)
                                    : message.content
                            }}
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