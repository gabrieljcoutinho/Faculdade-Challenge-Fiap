import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/animacaoComandoTrocaPageViaChat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/quickSuggestions.css';
import '../../CSS/Chat/iconeMic.css';
import '../../CSS/Chat/mediaScreen.css';

// Importações do pdf.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

import sendBtn from '../../imgs/imgChat/sendBtn.png';
import comandosData from '../../data/commands.json';
import library from '../../data/library.json'

import tvIcon from '../../imgs/imgConexao/TV.png';
import airConditionerIcon from '../../imgs/imgConexao/ar-condicionado.png';
import geladeira from '../../imgs/imgConexao/geladeira.png';
import lampIcon from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';
import logoGoodwe from '../../imgs/imgHeader/logo.png';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
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

// Linha CORRIGIDA para configurar o worker do pdf.js.
// Isso resolve o erro de "Module not found" sem que você precise mexer em pastas.


const Chat = ({ onConnectDevice, onDisconnectAll, onRemoveAll, productionData, setTheme, onConnectionTypeChange }) => {
    const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)) || []);
    const [firstInteraction, setFirstInteraction] = useState(() => {
        const saved = sessionStorage.getItem(FIRST_INTERACTION_KEY);
        return saved === null ? true : JSON.parse(saved);
    });
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [awaitingACConfirmation, setAwaitingACConfirmation] = useState(false);
    const [speakMode, setSpeakMode] = useState(() => sessionStorage.getItem('chat_speakMode') === 'true');
    const [screenReaderMode, setScreenReaderMode] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [pdfContent, setPdfContent] = useState({});

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    const quickSuggestions = ['Conectar TV','Conectar Ar-Condicionado','Conectar Lâmpada','Conectar Geladeira','Conectar Carregador'];

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setNewMessage(transcript);
            handleSendMessage();
        };

        recognitionRef.current = recognition;
    }, []);

    // Agora, o chat irá ler o library.json e processar o texto dos seus PDFs.
    useEffect(() => {
        const loadPdfs = async () => {
            const loadedContent = {};
            for (const doc of library.documents) {
                try {
                    const loadingTask = pdfjsLib.getDocument(doc.path);
                    const pdf = await loadingTask.promise;
                    let fullText = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ') + ' ';
                    }
                    loadedContent[doc.name] = fullText;
                    console.log(`Documento "${doc.name}" carregado com sucesso.`);
                } catch (error) {
                    console.error(`Erro ao carregar o PDF de ${doc.name}:`, error);
                }
            }
            setPdfContent(loadedContent);
        };

        loadPdfs();
    }, []);

    const handleMicClick = () => {
        if (recognitionRef.current) {
            if (isListening) recognitionRef.current.stop();
            else recognitionRef.current.start();
        }
    };

    useEffect(() => inputRef.current?.focus(), []);
    useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
    useEffect(() => sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)), [messages]);
    useEffect(() => sessionStorage.setItem(FIRST_INTERACTION_KEY, JSON.stringify(firstInteraction)), [firstInteraction]);
    useEffect(() => sessionStorage.setItem(NEW_MESSAGE_FLAG, hasNewMessage ? 'true' : 'false'), [hasNewMessage]);
    useEffect(() => sessionStorage.setItem('chat_speakMode', speakMode ? 'true' : 'false'), [speakMode]);
    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.removeItem(CHAT_STORAGE_KEY);
            sessionStorage.removeItem(FIRST_INTERACTION_KEY);
            sessionStorage.removeItem(NEW_MESSAGE_FLAG);
            sessionStorage.removeItem('chat_speakMode');
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    const speakText = text => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        }
    };

    const sendAssistantMessage = content => {
        setMessages(m => [...m, { role: 'assistant', content }]);
        if (speakMode || screenReaderMode) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const cleanText = content
                    .replace(/\*\*/g, '')
                    .replace(/\n-/g, ', ')
                    .replace(/(\d+)\s*kWh/g, '$1 quilowatt-hora')
                    .replace(/km\/h/g, 'quilômetros por hora');
                speakText(cleanText);
            }, 100);
        }
    };

    useEffect(() => {
        if (screenReaderMode && messages.length > 0) {
            const last = messages[messages.length - 1];
            if (last.role === 'assistant') {
                window.speechSynthesis.cancel();
                speakText(
                    last.content
                        .replace(/\*\*/g, '')
                        .replace(/\n-/g, ', ')
                        .replace(/(\d+)\s*kWh/g, '$1 quilowatt-hora')
                        .replace(/km\/h/g, 'quilômetros por hora')
                );
            }
        }
    }, [messages, screenReaderMode]);

    const connectionCommands = [
        { type: 'TV', keywords: ['tv','televisao','televisão'] },
        { type: 'Ar-Condicionado', keywords: ['ar-condicionado','ar condicionado'] },
        { type: 'Lâmpada', keywords: ['lampada','lâmpada'] },
        { type: 'Geladeira', keywords: ['geladeira'] },
        { type: 'Carregador', keywords: ['carregador'] }
    ];

    function parseTimeDelay(text) {
        const regex = /daqui\s+(\d+)\s*(h|min|s|hora|horas|minuto|minutos|segundo|segundos)/i;
        const match = text.match(regex);
        if (!match) return null;
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('hora')) return value*3600000;
        if (unit.startsWith('minuto')) return value*60000;
        if (unit.startsWith('segundo')) return value*1000;
        return null;
    }

    async function fetchClimaOpenWeather(cidade) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=pt_br`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Cidade não encontrada ou problema na API. Código: ${res.status}`);
        return res.json();
    }

    const handleSendMessage = useCallback(async e => {
        e?.preventDefault();
        const texto = newMessage.trim();
        if (!texto) return;
        setNewMessage('');
        setLoading(true);
        inputRef.current?.focus();

        if (awaitingACConfirmation) {
            const resposta = normalizeText(texto);
            if (resposta === 'sim') {
                onConnectDevice?.('Ar-Condicionado', airConditionerIcon);
                sendAssistantMessage('Ar-Condicionado conectado ✅');
            } else {
                sendAssistantMessage('Ar-Condicionado não conectado ❌');
            }
            setAwaitingACConfirmation(false);
            setLoading(false);
            return;
        }

        if (firstInteraction) setFirstInteraction(false);
        setMessages(m => [...m, { role: 'user', content: texto }]);
        const textoNormalizado = normalizeText(texto);
        let handledByLocalCommand = false;

        if (textoNormalizado === 'modo de fala') {
            setSpeakMode(true);
            sendAssistantMessage('Modo de fala ativado. 🗣️');
            handledByLocalCommand = true;
        } else if (textoNormalizado === 'desativar modo de fala') {
            setSpeakMode(false);
            window.speechSynthesis.cancel();
            sendAssistantMessage('Modo de fala desativado. 🔇');
            handledByLocalCommand = true;
        }

        if (
            ['modo leitor de tela','ativar leitor de tela','ativar leitura de tela','modo leitor tela','ativar leitor tela','ativar leitura tela'].includes(textoNormalizado)
        ) {
            setScreenReaderMode(true);
            sendAssistantMessage('Leitor de tela ativado. 👁️‍🗨️');
            handledByLocalCommand = true;
        } else if (
            ['desativar leitor tela','desligar leitor tela','desativar leitura tela','desativar leitor de tela','desligar leitor de tela','desativar leitura de tela'].includes(textoNormalizado)
        ) {
            setScreenReaderMode(false);
            window.speechSynthesis.cancel();
            sendAssistantMessage('Leitor de tela desativado.');
            handledByLocalCommand = true;
        }

        const climaMatch = texto.match(/clima em (.+)/i);
        if (climaMatch) {
            const cidade = climaMatch[1].trim();
            try {
                const data = await fetchClimaOpenWeather(cidade);
                const desc = data.weather[0].description;
                const temp = Math.round(data.main.temp);
                const umidity = data.main.humidity;
                const windSpeedKmH = (data.wind.speed * 3.6).toFixed(1);
                sendAssistantMessage(`Clima em **${data.name}**:\n- Condição: ${desc}\n- Temperatura: ${temp}°C\n- Umidade: ${umidity}%\n- Vento: ${windSpeedKmH} km/h`);
            } catch (err) {
                sendAssistantMessage(`Erro ao buscar clima: ${err.message}`);
            } finally { setLoading(false); inputRef.current?.focus(); }
            return;
        }

        if (textoNormalizado.startsWith('conectar')) {
            let afterConectar = texto.slice(9).trim();
            const delayMs = parseTimeDelay(afterConectar);
            const palavras = afterConectar.split(' ').filter(Boolean);
            let tipoEncontrado = null;
            let nomeExtra = '';
            for (const cmd of connectionCommands) {
                if (palavras.length>0 && cmd.keywords.includes(palavras[0].toLowerCase())) {
                    tipoEncontrado = cmd.type;
                    nomeExtra = palavras.slice(1).join(' ').replace(/daqui.*$/,'').trim();
                    break;
                }
            }
            if (tipoEncontrado) {
                const iconSrc = deviceIconMap[tipoEncontrado];
                const nomeCompleto = nomeExtra ? `${tipoEncontrado} ${nomeExtra}` : tipoEncontrado;

                if (tipoEncontrado==='Ar-Condicionado') {
                    try {
                        const clima = await fetchClimaOpenWeather('São Paulo');
                        const tempAtual = Math.round(clima.main.temp);
                        if (tempAtual<=20) {
                            sendAssistantMessage(`Está ${tempAtual}°C, frio para o Ar-Condicionado. Conectar mesmo assim? (SIM/NÃO)`);
                            setAwaitingACConfirmation(true);
                            setLoading(false);
                            return;
                        }
                    } catch(err){console.error(err);}
                }

                if (delayMs===null) {
                    onConnectDevice?.(nomeCompleto, iconSrc);
                    sendAssistantMessage(`**${nomeCompleto}** conectado ✅`);
                } else {
                    sendAssistantMessage(`Ok, vou conectar o ${nomeCompleto} daqui a ${delayMs/60000>=1 ? (delayMs/60000)+' minutos':(delayMs/1000)+' segundos'}. ⏳`);
                    setTimeout(()=>{
                        onConnectDevice?.(nomeCompleto, iconSrc);
                        sendAssistantMessage(`${nomeCompleto} conectado agora! ✅`);
                    }, delayMs);
                }
                handledByLocalCommand=true;
            } else { sendAssistantMessage('Dispositivo não reconhecido.'); handledByLocalCommand=true; }
        }

        if (!handledByLocalCommand) {
            const foundCmd = comandosData.comandos.find(c =>
                c.triggers?.some(t => textoNormalizado.includes(normalizeText(t)))
            );
            if (foundCmd) {
                if (foundCmd.resposta.startsWith("REDIRECT:")) {
                    const redirectPath = foundCmd.resposta.split(":")[1];
                    setIsFadingOut(true);
                    setTimeout(()=>navigate(redirectPath),700);
                    setLoading(false);
                    return;
                }
                switch(foundCmd.resposta){
                    case 'PRODUCAO_GRAFICO':
                        if(productionData?.datasets?.length>0){
                            const total = productionData.datasets[0].data.reduce((a,v)=>a+v,0).toFixed(2);
                            const hourly = productionData.labels.map((label, index) => `- **${label}**: **${productionData.datasets[0].data[index]} kWh**`).join('\n');
                            sendAssistantMessage(`**Produção diária**\nTotal: **${total} kWh**\n${hourly}`);
                        } else sendAssistantMessage('Não foi possível obter produção.');
                        break;
                    case 'TEMA_ESCURO':
                        document.body.classList.replace('light-theme','dark-theme');
                        localStorage.setItem('theme','dark-theme');
                        setTheme?.('dark-theme');
                        sendAssistantMessage('Tema escuro ativado! 🌙');
                        break;
                    case 'TEMA_CLARO':
                        document.body.classList.replace('dark-theme','light-theme');
                        localStorage.setItem('theme','light-theme');
                        setTheme?.('light-theme');
                        sendAssistantMessage('Tema claro ativado! ☀️');
                        break;
                    case 'DESCONECTAR_TODOS': onDisconnectAll?.(); sendAssistantMessage('Todos os aparelhos foram desconectados.'); break;
                    case 'REMOVER_TODOS': onRemoveAll?.(); sendAssistantMessage('Todos os aparelhos foram removidos.'); break;
                    case 'MUDAR_PARA_BATERIA': onConnectionTypeChange('bateria'); sendAssistantMessage('Modo de energia alterado para Bateria. 🔋'); break;
                    case 'MUDAR_PARA_CABO': onConnectionTypeChange('cabo'); sendAssistantMessage('Modo de energia alterado para Cabo. 🔌'); break;
                    default: sendAssistantMessage(foundCmd.resposta);
                }
                handledByLocalCommand=true;
            }
        }

        if (!handledByLocalCommand) {
            let pdfAnswer = null;
            const normalizedQuery = textoNormalizado;

            for (const docName in pdfContent) {
                const content = pdfContent[docName];
                if (normalizeText(content).includes(normalizedQuery)) {
                    pdfAnswer = `Encontrei a informação sobre "${texto}" no documento "${docName}".`;
                    break;
                }
            }

            if (pdfAnswer) {
                sendAssistantMessage(pdfAnswer);
                handledByLocalCommand = true;
            }
        }

        if (!handledByLocalCommand) {
            if(!GEMINI_API_KEY){ sendAssistantMessage('Erro: Chave Gemini não configurada'); setLoading(false); return; }
            try{
                const geminiMessages=[
                    {role:'model',parts:[{text:"Ok, entendi. Como posso ajudar?"}]},
                    ...messages.map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.content}]})),
                    {role:'user',parts:[{text: texto}]}
                ];
                const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({contents:geminiMessages,generationConfig:{temperature:0.9,topP:0.8,maxOutputTokens:1000}})
                });
                const data=await res.json();
                if(!res.ok) sendAssistantMessage(`Erro na Gemini: ${data.error?.message || 'Desconhecido'} (Código ${res.status})`);
                else if(data.candidates?.[0]?.content?.parts) sendAssistantMessage(data.candidates[0].content.parts[0].text.trim());
                else if(data.promptFeedback?.blockReason) sendAssistantMessage(`Mensagem bloqueada: ${data.promptFeedback.blockReason}`);
                else sendAssistantMessage('Resposta inválida da Gemini');
            } catch(err){ sendAssistantMessage(`Erro: ${err.message}`);}
        }

        setLoading(false);
        inputRef.current?.focus();
    }, [messages,newMessage,firstInteraction,onConnectDevice,onDisconnectAll,onRemoveAll,productionData,setTheme,onConnectionTypeChange,navigate,awaitingACConfirmation,speakMode,screenReaderMode, pdfContent]);

    useEffect(()=>{
        if(messages.length===0) return;
        const ultima=messages[messages.length-1];
        if(ultima.role==='assistant' && window.location.pathname!=='/chat') setHasNewMessage(true);
    },[messages]);

    return (
        <div className={`chat-container ${isFadingOut?'fade-out':''}`}>
            <div className="message-display-area">
                {firstInteraction && (
                    <div className="movimentoDaDiv">
                        <div className="messageBot">
                            <span className="message-bubble messagemInicial">
                                💡 Digite <strong>Comandos</strong> para receber comandos específicos do site.
                            </span>
                        </div>
                        <img
                            src={logoGoodwe}
                            alt="Imagem opaca"
                            className={`chat-center-image ${messages.length > 0 ? 'hide' : ''}`}
                        />
                    </div>
                )}
                {messages.filter(m=>m.role!=='system').map((m,i)=>(
                    <div key={i} className={`message ${m.role==='user'?'user':'bot'}`}>
                        <span
                            className="message-bubble"
                            dangerouslySetInnerHTML={{__html: m.role==='assistant'?DOMPurify.sanitize(marked.parse(m.content)):DOMPurify.sanitize(m.content)}}
                        />
                    </div>
                ))}
                {loading && (
                    <div className="message bot">
                        <span className="message-bubble">Digitando...</span>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>
            <div className="quick-suggestions">
                {quickSuggestions.map((s,index)=>(
                    <button key={index} type="button" className="suggestion-button" onClick={()=>setNewMessage(s)} title={`Clique para preencher: ${s}`}>{s}</button>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="input-with-mic">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={e=>setNewMessage(e.target.value)}
                        placeholder="Sua mensagem..."
                        className="message-input"
                        disabled={loading}
                        autoComplete="off"
                        title="Digite sua mensagem"
                    />
                    <button
                        type="button"
                        className={`mic-button ${isListening?'listening':''}`}
                        onClick={handleMicClick}
                        title={isListening?'Parar escuta':'Clique para falar'}
                    >
                        🎤
                    </button>
                </div>
                <button type="submit" className="send-button" disabled={loading}>
                    <img src={sendBtn} alt="Enviar" className="send-icon"/>
                </button>
            </form>
        </div>
    );
};

export default Chat;