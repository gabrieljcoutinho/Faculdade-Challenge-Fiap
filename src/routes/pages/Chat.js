import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Estilos
import '../../CSS/Chat/chat.module.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.module.css';
import '../../CSS/Chat/mensagem.module.css';
import '../../CSS/Chat/send.module.css';
import '../../CSS/Chat/quickSuggestions.module.css';
import '../../CSS/Chat/iconeMic.module.css';
import '../../CSS/Chat/iconeLixeiraChat.module.css';
import '../../CSS/Chat/imgCentroChat.module.css';
import '../../CSS/Chat/mediaScreen.css';

// Dados e Imagens
import comandosData from '../../data/commands.json';
import library from '../../data/library.json';
import sendBtn from '../../imgs/imgChat/sendBtn.png';
import excluir from '../../imgs/imgChat/excluir.png';
import logoGoodwe from '../../imgs/imgHeader/logo.png';
import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';

const REACT_APP_GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

const deviceIconMap = {
    TV: tvIcon,
    'Ar-Condicionado': airConditionerIcon,
    'Lâmpada': lampIcon,
    Geladeira: geladeira,
    Carregador: carregador,
};

const Chat = ({ onConnectDevice, onDisconnectAll, onRemoveAll, productionData, setTheme, onConnectionTypeChange }) => {
    const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem('chat_messages')) || []);
    const [firstInteraction, setFirstInteraction] = useState(() => JSON.parse(sessionStorage.getItem('chat_firstInteraction')) ?? true);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakMode, setSpeakMode] = useState(() => sessionStorage.getItem('chat_speakMode') === 'true');
    const [pdfContent, setPdfContent] = useState({});

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    // 1. Configuração de Reconhecimento de Voz
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.onresult = (e) => {
                const text = e.results[0][0].transcript;
                setNewMessage(text);
                // O envio automático pode ser disparado aqui se desejar
            };
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    // 2. Carregamento de PDFs (Melhorado com extração de texto)
    useEffect(() => {
        const loadPdfs = async () => {
            const loaded = {};
            for (const doc of library.documents) {
                try {
                    const pdf = await pdfjsLib.getDocument(doc.path).promise;
                    let text = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(s => s.str).join(" ") + " ";
                    }
                    loaded[doc.name.toLowerCase()] = text;
                } catch (e) { console.error("Erro PDF:", e); }
            }
            setPdfContent(loaded);
        };
        loadPdfs();
    }, []);

    // 3. Persistência de Dados
    useEffect(() => {
        sessionStorage.setItem('chat_messages', JSON.stringify(messages));
        sessionStorage.setItem('chat_firstInteraction', JSON.stringify(firstInteraction));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, firstInteraction]);

    // 4. Função de Fala (TTS)
    const speak = (text) => {
        if (!speakMode) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
    };

    const addMessage = (role, content) => {
        setMessages(prev => [...prev, { role, content }]);
        if (role === 'assistant') speak(content);
    };

    // 5. Lógica Principal de Mensagens
    const handleSendMessage = useCallback(async (e) => {
        e?.preventDefault();
        const input = newMessage.trim();
        if (!input || loading) return;

        setNewMessage('');
        setLoading(true);
        if (firstInteraction) setFirstInteraction(false);

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);

        const lowerInput = input.toLowerCase();

        // --- COMANDOS LOCAIS E REGRAS DE NEGÓCIO ---

        // Clima
        if (lowerInput.includes('clima em')) {
            const cidade = lowerInput.split('clima em')[1].trim();
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=pt_br`);
                const data = await res.json();
                addMessage('assistant', `Em **${data.name}**: ${data.weather[0].description}, ${Math.round(data.main.temp)}°C.`);
            } catch { addMessage('assistant', 'Não consegui verificar o clima agora.'); }
            setLoading(false);
            return;
        }

        // Conectar Dispositivos (com lógica de atraso/delay)
        if (lowerInput.startsWith('conectar')) {
            const deviceKey = Object.keys(deviceIconMap).find(k => lowerInput.includes(k.toLowerCase()));
            if (deviceKey) {
                onConnectDevice?.(deviceKey, deviceIconMap[deviceKey]);
                addMessage('assistant', `${deviceKey} conectado com sucesso! ✅`);
                setLoading(false); return;
            }
        }

        // Comandos do JSON (Redirecionamentos e Temas)
        const cmd = comandosData.comandos.find(c => c.triggers.some(t => lowerInput.includes(t.toLowerCase())));
        if (cmd) {
            if (cmd.resposta.startsWith('REDIRECT:')) {
                navigate(cmd.resposta.split(':')[1]);
            } else {
                addMessage('assistant', cmd.resposta);
            }
            setLoading(false); return;
        }

        // --- INTEGRAÇÃO COM GEMINI (IA) ---
        try {
            // Contexto dinâmico para a IA
            const solarStatus = productionData?.datasets?.[0]?.data.slice(-1)[0] || 0;
            const systemPrompt = `Você é o Assistente Smart GoodWe.
            Contexto: Produção solar atual é ${solarStatus}kWh.
            Documentos disponíveis: ${Object.keys(pdfContent).join(', ')}.
            Se o usuário perguntar algo contido nos documentos, use estas informações: ${JSON.stringify(pdfContent).substring(0, 2000)}.
            Seja breve e técnico.
            Ajude sempre  ousuári ocaso nao enteda algo.
            traga exemplos.
            Seje direto sem duplo sentido`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${REACT_APP_GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt }] },
                        { role: 'model', parts: [{ text: "Entendido. Sou o assistente GoodWe e estou pronto." }] },
                        ...messages.slice(-4).map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            parts: [{ text: m.content }]
                        })),
                        { role: 'user', parts: [{ text: input }] }
                    ],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                })
            });

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um erro técnico.";
            addMessage('assistant', aiText);

        } catch (err) {
            addMessage('assistant', "Erro ao conectar com a inteligência artificial.");
        } finally {
            setLoading(false);
        }
    }, [newMessage, messages, pdfContent, productionData, firstInteraction, navigate, onConnectDevice]);

    return (
        <div className="chat-container">
            <div className="message-display-area">
                {firstInteraction && (
                    <div className="movimentoDaDiv">
                        <div className="messageBot">
                            <span className="message-bubble messagemInicial">
                                💡 Olá! Sou seu assistente **GoodWe**. Posso controlar seus dispositivos, checar o clima ou analisar sua produção solar.
                            </span>
                        </div>
                        <img src={logoGoodwe} alt="Logo" className="chat-center-image" />
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role === 'user' ? 'user' : 'bot'}`}>
                        <span
                            className="message-bubble"
                            dangerouslySetInnerHTML={{
                                __html: m.role === 'assistant' ? DOMPurify.sanitize(marked.parse(m.content)) : DOMPurify.sanitize(m.content)
                            }}
                        />
                    </div>
                ))}
                {loading && <div className="message bot"><span className="message-bubble">Analisando... ⚙️</span></div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="quick-suggestions">
                {['Conectar TV', 'Status Energia', 'Clima em São Paulo', 'Modo Escuro'].map(s => (
                    <button key={s} className="suggestion-button" onClick={() => setNewMessage(s)}>{s}</button>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="input-with-mic">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Pergunte sobre sua energia ou dispositivos..."
                        className="message-input"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={() => {
                            if (isListening) recognitionRef.current.stop();
                            else { setIsListening(true); recognitionRef.current.start(); }
                        }}
                    >
                        {isListening ? '🛑' : '🎤'}
                    </button>
                </div>

                <button type="submit" className="send-button" disabled={loading}>
                    <img src={sendBtn} alt="Enviar" className="send-icon" />
                </button>

                <button type="button" className="clear-button" onClick={() => setMessages([])}>
                    <img src={excluir} alt="Limpar" className="iconeImgTrash" />
                </button>
            </form>
        </div>
    );
};

export default Chat;