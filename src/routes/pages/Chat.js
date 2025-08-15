import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/quickSuggestions.css';
import '../../CSS/Chat/mediaScreen.css';
import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';

// Ícones
import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';

// Chaves de API e constantes
const GEMINI_API_KEY = 'AIzaSyA_OEC15jeB1rJsNrRYO3v7QDan7J3AWPg';
const OPENWEATHER_API_KEY = '50b5d79d3b8c0475ba7dba090402b21c';
const CHAT_STORAGE_KEY = 'chat_messages';
const FIRST_INTERACTION_KEY = 'chat_firstInteraction';
const NEW_MESSAGE_FLAG = 'hasNewChatMessage';

const normalizeText = t => t.trim().toLowerCase();

const deviceIconMap = {
    TV: tvIcon,
    'Ar-Condicionado': airConditionerIcon,
    'Lâmpada': lampIcon,
    Geladeira: geladeira,
    Carregador: carregador,
};

const Chat = ({ onConnectDevice, onDisconnectAll, onRemoveAll, productionData, setTheme, onConnectionTypeChange }) => {
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [firstInteraction, setFirstInteraction] = useState(() => {
        const saved = sessionStorage.getItem(FIRST_INTERACTION_KEY);
        return saved === null ? true : JSON.parse(saved);
    });
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [awaitingACConfirmation, setAwaitingACConfirmation] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const quickSuggestions = [
        'Conectar TV',
        'Conectar Ar-Condicionado',
        'Conectar Lâmpada',
        'Conectar Geladeira',
        'Conectar Carregador'
    ];

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        sessionStorage.setItem(FIRST_INTERACTION_KEY, JSON.stringify(firstInteraction));
    }, [firstInteraction]);

    useEffect(() => {
        sessionStorage.setItem(NEW_MESSAGE_FLAG, hasNewMessage ? 'true' : 'false');
    }, [hasNewMessage]);

    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.removeItem(CHAT_STORAGE_KEY);
            sessionStorage.removeItem(FIRST_INTERACTION_KEY);
            sessionStorage.removeItem(NEW_MESSAGE_FLAG);
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    const connectionCommands = [
        { type: 'TV', keywords: ['tv', 'televisao', 'televisão'] },
        { type: 'Ar-Condicionado', keywords: ['ar-condicionado', 'ar condicionado'] },
        { type: 'Lâmpada', keywords: ['lampada', 'lâmpada'] },
        { type: 'Geladeira', keywords: ['geladeira'] },
        { type: 'Carregador', keywords: ['carregador'] }
    ];

    function parseTimeDelay(text) {
        const regex = /daqui\s+(\d+)\s*(hora|horas|minuto|minutos|segundo|segundos)/i;
        const match = text.match(regex);
        if (!match) return null;
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('hora')) return value * 3600000;
        if (unit.startsWith('minuto')) return value * 60000;
        if (unit.startsWith('segundo')) return value * 1000;
        return null;
    }

    async function fetchClimaOpenWeather(cidade) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=pt_br`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Cidade não encontrada ou problema na API. Código: ${res.status}`);
        return res.json();
    }

    const handleSendMessage = useCallback(async e => {
        e.preventDefault();
        const texto = newMessage.trim();
        if (!texto) return;

        setNewMessage('');
        setLoading(true);
        inputRef.current?.focus();

        // --- TRATAMENTO DE CONFIRMAÇÃO DO AR-CONDICIONADO ---
        if (awaitingACConfirmation) {
            const resposta = normalizeText(texto);
            if (resposta === 'sim') {
                onConnectDevice?.('Ar-Condicionado', airConditionerIcon);
                setMessages(m => [...m, { role: 'assistant', content: 'Ar-Condicionado conectado ✅' }]);
            } else {
                setMessages(m => [...m, { role: 'assistant', content: 'Ar-Condicionado não conectado ❌' }]);
            }
            setAwaitingACConfirmation(false);
            setLoading(false);
            return;
        }

        if (firstInteraction) setFirstInteraction(false);
        setMessages(m => [...m, { role: 'user', content: texto }]);

        const textoNormalizado = normalizeText(texto);
        let handledByLocalCommand = false;
        let botResponseContent = '';

        // COMANDO: clima em [cidade]
        const climaMatch = texto.match(/clima em (.+)/i);
        if (climaMatch) {
            const cidade = climaMatch[1].trim();
            try {
                const data = await fetchClimaOpenWeather(cidade);
                const desc = data.weather[0].description;
                const temp = Math.round(data.main.temp);
                const umidity = data.main.humidity;
                const wind = data.wind.speed;
                botResponseContent = `Clima em **${data.name}**:\n- Condição: ${desc}\n- Temperatura: ${temp}°C\n- Umidade: ${umidity}%\n- Vento: ${wind} km/h`;
            } catch (error) {
                botResponseContent = `Erro ao buscar clima: ${error.message}`;
            } finally {
                setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
                setLoading(false);
                inputRef.current?.focus();
            }
            return;
        }

        // COMANDO: conectar dispositivos
        if (textoNormalizado.startsWith('conectar')) {
            let afterConectar = texto.slice(9).trim();
            const delayMs = parseTimeDelay(afterConectar);
            const palavras = afterConectar.split(' ').filter(Boolean);
            let tipoEncontrado = null;
            let nomeExtra = '';
            for (const cmd of connectionCommands) {
                if (palavras.length > 0 && cmd.keywords.includes(palavras[0].toLowerCase())) {
                    tipoEncontrado = cmd.type;
                    nomeExtra = palavras.slice(1).join(' ').replace(/daqui.*$/, '').trim();
                    break;
                }
            }

            if (tipoEncontrado) {
                const iconSrc = deviceIconMap[tipoEncontrado];
                const nomeCompleto = nomeExtra ? `${tipoEncontrado} ${nomeExtra}` : tipoEncontrado;

                // AR-CONDICIONADO: verifica temperatura
                if (tipoEncontrado === 'Ar-Condicionado') {
                    try {
                        const cidade = 'São Paulo'; // pode ser dinâmica
                        const clima = await fetchClimaOpenWeather(cidade);
                        const tempAtual = Math.round(clima.main.temp);

                        if (tempAtual <= 20) {
                            botResponseContent = `No momento está ${tempAtual}°C, está um pouco frio para conectar o Ar-Condicionado. Deseja conectar mesmo assim? (SIM/NÃO)`;
                            setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
                            setAwaitingACConfirmation(true);
                            setLoading(false);
                            return;
                        }
                    } catch (err) {
                        console.error('Erro ao obter temperatura:', err);
                    }
                }

                if (delayMs === null) {
                    onConnectDevice?.(nomeCompleto, iconSrc);
                    botResponseContent = `${nomeCompleto} conectado ✅`;
                } else {
                    botResponseContent = `Ok, vou conectar o ${nomeCompleto} daqui a ${delayMs / 60000 >= 1 ? (delayMs / 60000) + ' minutos' : (delayMs / 1000) + ' segundos'}. ⏳`;
                    setTimeout(() => {
                        onConnectDevice?.(nomeCompleto, iconSrc);
                        setMessages(m => [...m, { role: 'assistant', content: `${nomeCompleto} conectado agora! ✅` }]);
                    }, delayMs);
                }
                handledByLocalCommand = true;
            } else {
                botResponseContent = 'Dispositivo não reconhecido para conexão.';
                handledByLocalCommand = true;
            }
        }

        // Comandos fixos JSON e navegação
        if (!handledByLocalCommand) {
            const foundCmd = comandosData.comandos.find(c =>
                c.triggers?.some(t => textoNormalizado.includes(normalizeText(t)))
            );

            if (foundCmd) {
                if (foundCmd.resposta.startsWith("REDIRECT:")) {
                    const redirectPath = foundCmd.resposta.split(":")[1];
                    setIsFadingOut(true);
                    setTimeout(() => navigate(redirectPath), 700);
                    setLoading(false);
                    return;
                }

                switch (foundCmd.resposta) {
                    case 'PRODUCAO_GRAFICO':
                        if (productionData && productionData.datasets?.length > 0) {
                            const totalProduction = productionData.datasets[0].data.reduce((acc, val) => acc + val, 0).toFixed(2);
                            const hourlyData = productionData.labels.map((label, index) =>
                                `- ${label}: **${productionData.datasets[0].data[index]} kWh**`
                            ).join('\n');
                            botResponseContent = `**Relatório de Produção Diária**\n\nProdução total de hoje: **${totalProduction} kWh**\n\n**Produção por hora:**\n${hourlyData}`;
                        } else {
                            botResponseContent = 'Não foi possível obter os dados de produção no momento. Tente novamente mais tarde.';
                        }
                        break;
                    case 'TEMA_ESCURO':
                        document.body.classList.replace('light-theme', 'dark-theme');
                        localStorage.setItem('theme', 'dark-theme');
                        setTheme?.('dark-theme');
                        botResponseContent = "Tema escuro ativado! 🌙";
                        break;
                    case 'TEMA_CLARO':
                        document.body.classList.replace('dark-theme', 'light-theme');
                        localStorage.setItem('theme', 'light-theme');
                        setTheme?.('light-theme');
                        botResponseContent = "Tema claro ativado! ☀️";
                        break;
                    case 'DESCONECTAR_TODOS':
                        onDisconnectAll?.();
                        botResponseContent = "Todos os aparelhos foram desconectados.";
                        break;
                    case 'REMOVER_TODOS':
                        onRemoveAll?.();
                        botResponseContent = "Todos os aparelhos foram removidos.";
                        break;
                    case 'MUDAR_PARA_BATERIA':
                        onConnectionTypeChange('bateria');
                        botResponseContent = "Modo de energia alterado para Bateria. 🔋";
                        break;
                    case 'MUDAR_PARA_CABO':
                        onConnectionTypeChange('cabo');
                        botResponseContent = "Modo de energia alterado para Cabo. 🔌";
                        break;
                    default:
                        botResponseContent = foundCmd.resposta;
                }
                handledByLocalCommand = true;
            }
        }

        if (handledByLocalCommand) {
            setTimeout(() => {
                setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
                setLoading(false);
                inputRef.current?.focus();
            }, 500);
            return;
        }

        // Fallback Gemini API
        if (!GEMINI_API_KEY) {
            setMessages(m => [...m, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
            setLoading(false);
            inputRef.current?.focus();
            return;
        }

        try {
            const geminiMessages = [
                { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
                ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
                { role: 'user', parts: [{ text: texto }] }
            ];
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: geminiMessages, generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 } })
            });
            const data = await res.json();
            if (!res.ok) {
                botResponseContent = `Erro na API Gemini: ${data.error?.message || 'Problema desconhecido'} (Código: ${res.status})`;
            } else if (data.candidates?.[0]?.content?.parts) {
                botResponseContent = data.candidates[0].content.parts[0].text.trim();
            } else if (data.promptFeedback?.blockReason) {
                botResponseContent = `Sua mensagem foi bloqueada: ${data.promptFeedback.blockReason}`;
            } else {
                botResponseContent = 'Resposta inválida da API Gemini';
            }
        } catch (error) {
            botResponseContent = `Erro: ${error.message}`;
        } finally {
            setMessages(m => [...m, { role: 'assistant', content: botResponseContent }]);
            setLoading(false);
            inputRef.current?.focus();
        }
    }, [messages, newMessage, firstInteraction, onConnectDevice, onDisconnectAll, onRemoveAll, productionData, setTheme, onConnectionTypeChange, navigate, isFadingOut, awaitingACConfirmation]);

    useEffect(() => {
        if (messages.length === 0) return;
        const ultima = messages[messages.length - 1];
        if (ultima.role === 'assistant') {
            if (window.location.pathname !== '/chat') {
                setHasNewMessage(true);
            }
        }
    }, [messages]);

    return (
        <div className={`chat-container ${isFadingOut ? 'fade-out' : ''}`}>
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
                {messages.filter(m => m.role !== 'system').map((m, i) => (
                    <div key={i} className={`message ${m.role === 'user' ? 'user' : 'bot'}`}>
                        <span
                            className="message-bubble"
                            dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? DOMPurify.sanitize(marked.parse(m.content)) : DOMPurify.sanitize(m.content) }}
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
            <div className="quick-suggestions">
                {quickSuggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        type="button"
                        className="suggestion-button"
                        onClick={() => setNewMessage(suggestion)}
                        title={`Clique para preencher: ${suggestion}`}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Sua mensagem..."
                    className="message-input"
                    disabled={loading}
                    autoComplete="off"
                    title="Digite seu texto ou sua mensagem"
                />
                <button type="submit" className="send-button" disabled={loading}>
                    <img src={sendBtn} alt="Enviar" className="send-icon" title="Enviar Texto ou Mensagem" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
