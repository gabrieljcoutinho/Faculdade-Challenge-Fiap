import React, { useState, useRef, useEffect } from 'react';
import '../../CSS/Chat/chat.css';
import '../../CSS/Chat/mensagem.css';
import '../../CSS/Chat/send.css';
import '../../CSS/Chat/modoResposta.css';
import sendBtn from '../../imgs/sendBtn.png';

import comandosData from '../../data/commands.json';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const modePrompts = {
  professor: 'Você é um professor didático e paciente. Explique conceitos com clareza, usando exemplos práticos simples, de forma que até iniciantes compreendam. Seja sempre gentil e objetivo.',
  profissional: 'Você é um assistente profissional e técnico. Forneça respostas detalhadas, precisas e formais, utilizando termos técnicos quando apropriado. Seja claro e direto.',
  engracado: 'Você é engraçado e descontraído. Responda de forma leve e divertida, usando humor e analogias engraçadas para facilitar o entendimento.',
  coaching: 'Você é um coach motivador. Inspire o usuário com respostas positivas, motivacionais e encorajadoras, ajudando-o a superar dúvidas com confiança.',
  calmo: 'Você é calmo e reflexivo. Responda com tranquilidade, promovendo reflexão e clareza, usando linguagem serena e acolhedora.'
};

const normalizeText = (text) => text.trim().toLowerCase();

const Chat = ({ onConnectDevice, productionData }) => {
  const [mode, setMode] = useState('profissional');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para analisar os dados de produção e gerar um relatório
  const analyzeProductionData = (data) => {
    const labels = data.labels;
    const values = data.datasets[0].data;

    if (!values || values.length === 0) {
      return "Não há dados de produção disponíveis para análise.";
    }

    const totalProduction = values.reduce((sum, val) => sum + val, 0);
    const averageProduction = totalProduction / values.length;
    const maxProduction = Math.max(...values);
    const minProduction = Math.min(...values);

    const maxIndex = values.indexOf(maxProduction);
    const minIndex = values.indexOf(minProduction);

    const maxTime = labels[maxIndex];
    const minTime = labels[minIndex];

    let analysisReport = `Relatório de Produção de Energia Solar:\n\n`;
    analysisReport += `- Produção Total: ${totalProduction.toFixed(2)} kWh\n`;
    analysisReport += `- Produção Média por Hora: ${averageProduction.toFixed(2)} kWh\n`;
    analysisReport += `- Pico de Produção: ${maxProduction.toFixed(2)} kWh às ${maxTime}\n`;
    analysisReport += `- Menor Produção: ${minProduction.toFixed(2)} kWh às ${minTime}\n\n`;

    analysisReport += "Detalhes por hora:\n";
    labels.forEach((label, index) => {
      analysisReport += `- ${label}: ${values[index].toFixed(2)} kWh\n`;
    });

    return analysisReport;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const texto = newMessage.trim();
    if (!texto) return;

    const textoNormalizado = normalizeText(texto);

    const comandoEncontrado = comandosData.comandos.find(cmd =>
      cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
    );

    let deviceToConnect = null;
    let customDeviceName = null;

    const connectionCommands = [
      { type: 'TV', triggers: ['conectar tv', 'ligar tv', 'conectar televisão'] },
      { type: 'Ar-Condicionado', triggers: ['conectar ar-condicionado', 'ligar ar-condicionado', 'conectar ar condicionado', 'ligar ar condicionado'] },
      { type: 'Lâmpada', triggers: ['conectar lâmpada', 'ligar lâmpada', 'conectar lampada', 'ligar lampada'] },
      { type: 'Airfry', triggers: ['conectar airfry', 'ligar airfry'] },
      { type: 'Carregador', triggers: ['conectar carregador', 'ligar carregador'] }
    ];

    for (const cmd of connectionCommands) {
      for (const trigger of cmd.triggers) {
        const normalizedTrigger = normalizeText(trigger);
        if (textoNormalizado.startsWith(normalizedTrigger)) {
          deviceToConnect = cmd.type;
          customDeviceName = texto.substring(trigger.length).trim();

          if (customDeviceName === '') {
            customDeviceName = deviceToConnect;
          } else {
            customDeviceName = customDeviceName.charAt(0).toUpperCase() + customDeviceName.slice(1);
          }
          break;
        }
      }
      if (deviceToConnect) break;
    }

    // Lógica para comandos de CONEXÃO de dispositivo (prioridade alta)
    if (deviceToConnect) {
      if (typeof onConnectDevice === 'function') {
        onConnectDevice(deviceToConnect, customDeviceName);
      }

      let resposta = "Comando de conexão executado.";
      const connectionCommandInJson = comandosData.comandos.find(cmd =>
        cmd.triggers.some(trigger => normalizeText(trigger) === textoNormalizado)
      );
      if (connectionCommandInJson) {
        resposta = connectionCommandInJson.resposta;
      } else {
        resposta = `${customDeviceName} Conectado.`;
      }

      setMessages(prev => [
        ...prev,
        { role: 'user', content: texto },
        { role: 'assistant', content: resposta }
      ]);
      setNewMessage('');
      return;
    }

    // Lógica para OUTROS comandos do JSON (incluindo o novo comando de análise)
    if (comandoEncontrado) {
        if (comandoEncontrado.resposta === "ANALISAR_GRAFICO_PRODUCAO") {
            // Se o comando é para analisar o gráfico, gere o relatório COMPLETO aqui
            const report = analyzeProductionData(productionData); // Chame a função de análise
            setMessages(prev => [
                ...prev,
                { role: 'user', content: texto },
                { role: 'assistant', content: report } // Use o relatório gerado como resposta
            ]);
        } else {
            // Para outros comandos do JSON, use a resposta padrão
            setMessages(prev => [
                ...prev,
                { role: 'user', content: texto },
                { role: 'assistant', content: comandoEncontrado.resposta }
            ]);
        }
        setNewMessage('');
        return;
    }

    // Se não for um comando conhecido do JSON (incluindo conexão ou análise),
    // então envia a mensagem para a API Gemini.
    const userMessage = { role: 'user', content: texto };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setLoading(true);

    if (!GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro: Chave da API Gemini não configurada.' }]);
      setLoading(false);
      return;
    }

    try {
      const geminiMessages = [
        { role: 'user', parts: [{ text: modePrompts[mode] }] },
        { role: 'model', parts: [{ text: "Ok, entendi. Como posso ajudar?" }] },
        ...updatedMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      ];

      const payload = {
        contents: geminiMessages,
        generationConfig: { temperature: 0.9, topP: 0.8, maxOutputTokens: 1000 }
      };

      const apiKey = GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `Erro na API Gemini: ${errorData.error?.message || 'Problema desconhecido'} (Código: ${response.status})` }]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.candidates[0].content.parts[0].text.trim() }]);
      } else if (data.promptFeedback?.blockReason) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Sua mensagem foi bloqueada devido a políticas de segurança: ${data.promptFeedback.blockReason}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Resposta inválida da API Gemini' }]);
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
        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
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