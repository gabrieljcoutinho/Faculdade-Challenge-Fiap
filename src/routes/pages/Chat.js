import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked'; // Certifique-se de que 'marked' está instalado
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';

// Importe o JSON de comandos
import comandosData from '../../data/commands.json'; // Verifique o caminho correto do seu commands.json

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const modePrompts = {
    professor: 'Você é um professor didático e paciente. Explique conceitos com clareza, usando exemplos práticos simples, de forma que até iniciantes compreendam. Seja sempre gentil e objetivo.',
    profissional: 'Você é um assistente profissional e técnico. Forneça respostas detalhadas, precisas e formais, utilizando termos técnicos quando apropriado. Seja claro e direto.',
    engracado: 'Você é engraçado e descontraído. Responda de forma leve e divertida, usando humor e analogias engraçadas para facilitar o entendimento.',
    coaching: 'Você é um coach motivador. Inspire o usuário com respostas positivas, motivacionais e encorajadoras, ajudando-o a superar dúvidas com confiança.',
    calmo: 'Você é calmo e reflexivo. Responda com tranquilidade, promovendo reflexão e clareza, usando linguagem serena e acolhedora.'
};

const normalizeText = (text) => text.trim().toLowerCase();

// O componente Chat agora recebe productionData como uma prop
const Chat = ({ onConnectDevice, productionData }) => {
    const [mode, setMode] = useState('profissional');
    // Mude a inicialização do estado `messages` para um array vazio
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatProductionData = (data) => {
        if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
            return "Não há dados de produção solar disponíveis no momento.";
        }

        const labels = data.labels;
        const productionValues = data.datasets[0].data; // Assumindo que o primeiro dataset é a produção

        let response = "Produção de energia solar:\n\n";
        response += "| Hora | Produção (k/Wh) |\n";
        response += "|------|----------------|\n";

        let totalProduction = 0;
        for (let i = 0; i < labels.length; i++) {
            const hour = labels[i];
            const value = productionValues[i];
            response += `| ${hour} | ${value} kW/h       |\n`;
            totalProduction += value;
        }

        response += `\nProdução total registrada: ${totalProduction} kWh.`;
        return response;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const texto = newMessage.trim();
        if (!texto) return;

        const textoNormalizado = normalizeText(texto);

        // Adiciona a mensagem do usuário imediatamente ao estado
        setMessages(prev => [...prev, { role: 'user', content: texto }]);
        setNewMessage('');
        setLoading(true);

        // --- Lógica para comandos locais (conexão e análise de gráfico) ---
        let handledByLocalCommand = false;
        let botResponseContent = '';

        // 1. Lógica para Comandos de Conexão de Dispositivos
        const connectionCommands = [
            { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão'] },
            { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado'] },
            { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada'] },
            { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry'] },
            { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador'] }
        ];

        let deviceToConnect = null;
        let customDeviceName = null;

        for (const cmd of connectionCommands) {
            for (const trigger of cmd.triggers) {
                const normalizedTrigger = normalizeText(trigger);
                if (textoNormalizado.startsWith(normalizedTrigger)) {
                    deviceToConnect = cmd.type;
                    // Tenta extrair um nome personalizado após o gatilho
                    customDeviceName = texto.substring(trigger.length).trim();
                    if (customDeviceName === '') {
                        customDeviceName = deviceToConnect;
                    } else {
                        // Capitaliza a primeira letra do nome personalizado, se houver
                        customDeviceName = customDeviceName.charAt(0).toUpperCase() + customDeviceName.slice(1);
                    }
                    break;
                }
            }
            if (deviceToConnect) break;
        }

        if (deviceToConnect) {
            if (typeof onConnectDevice === 'function') {
                onConnectDevice(deviceToConnect, customDeviceName);
            }
            // Encontra a resposta padrão do JSON para o comando de conexão, se existir
            const connectionCommandInJson = comandosData.comandos.find(cmd =>
                cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
            );
            if (connectionCommandInJson) {
                botResponseContent = connectionCommandInJson.resposta;
            } else {
                botResponseContent = `${customDeviceName} Conectado.`;
            }
            handledByLocalCommand = true;
        } else {
            // 2. Lógica para Outros Comandos Locais (incluindo "Analisar gráfico")
            const comandoEncontrado = comandosData.comandos.find(cmd =>
                cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
            );

            if (comandoEncontrado) {
                if (comandoEncontrado.resposta === 'PRODUCAO_GRAFICO') {
                    botResponseContent = formatProductionData(productionData);
                } else {
                    botResponseContent = comandoEncontrado.resposta;
                }
                handledByLocalCommand = true;
            }
        }

        if (handledByLocalCommand) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
                setLoading(false);
            }, 500); // Pequeno atraso para simular o "processamento"
            return;
        }

        // --- Se não for um comando local, envia para a API Gemini ---
        if (!GEMINI_API_KEY) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
            setLoading(false);
            return;
        }

        try {
            // Prepara as mensagens para a API Gemini, incluindo o prompt de modo
            const geminiMessages = [
                { role: 'user', parts: [{ text: modePrompts[mode] }] },
                { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] }, // Resposta inicial do bot para o prompt de modo
                ...messages.map(msg => ({ // Adiciona as mensagens anteriores (exceto a do sistema)
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                { role: 'user', parts: [{ text: texto }] } // Adiciona a mensagem atual do usuário
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
                {/* Filtra mensagens com role 'system' que são usadas apenas para o prompt da API */}
                {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'user' : 'bot'}`}
                    >
                        <span
                            className="message-bubble"
                            // Usa dangerouslySetInnerHTML para renderizar markdown do bot
                            dangerouslySetInnerHTML={{
                                __html: message.role === 'assistant' ? marked.parse(message.content) : message.content
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