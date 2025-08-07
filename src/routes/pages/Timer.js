import React, { useState, useEffect } from 'react';
import '../../CSS/Timer/index.css';

import tv from '../../imgs/imgConexao/TV.png';
import lampada from '../../imgs/imgConexao/lampada.png';
import carregador from '../../imgs/imgConexao/carregador.png';
import arCondicionado from '../../imgs/imgConexao/ar-condicionado.png';
import airfry from '../../imgs/imgConexao/airfry.png';

const diasSemana = [
  { nome: 'Domingo', inicial: 'D' },
  { nome: 'Segunda', inicial: 'S' },
  { nome: 'Terça', inicial: 'T' },
  { nome: 'Quarta', inicial: 'Q' },
  { nome: 'Quinta', inicial: 'Q' },
  { nome: 'Sexta', inicial: 'S' },
  { nome: 'Sábado', inicial: 'S' }
];

const aparelhos = [
  { id: 1, imagem: tv, corFundo: '#e0f7fa' },
  { id: 2, imagem: lampada, corFundo: '#fff9c4' },
  { id: 3, imagem: carregador, corFundo: '#ffe0b2' },
  { id: 4, imagem: arCondicionado, corFundo: '#d1c4e9' },
  { id: 5, imagem: airfry, corFundo: '#c8e6c9' }
];

// Função para carregar o estado inicial do localStorage
const getInitialState = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
    return defaultValue;
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error);
    return defaultValue;
  }
};

const Timer = () => {
  const [configs, setConfigs] = useState(() =>
    getInitialState(
      'agendamentos',
      aparelhos.map(() => ({ nome: '', diasSelecionados: [], horario: '' }))
    )
  );

  const [diasVermelhos, setDiasVermelhos] = useState(() =>
    getInitialState(
      'diasVermelhos',
      aparelhos.map(() => [])
    )
  );

  // Salva os estados no localStorage sempre que eles mudam
  useEffect(() => {
    localStorage.setItem('agendamentos', JSON.stringify(configs));
    localStorage.setItem('diasVermelhos', JSON.stringify(diasVermelhos));
  }, [configs, diasVermelhos]);

  const toggleDia = (indexAparelho, diaIndex) => {
    // Cria uma nova cópia do array de configurações
    setConfigs(prevConfigs => {
      const novoConfigs = [...prevConfigs];
      const diasAtuais = novoConfigs[indexAparelho].diasSelecionados;

      const novoDias = diasAtuais.includes(diaIndex)
        ? diasAtuais.filter(d => d !== diaIndex)
        : [...diasAtuais, diaIndex];

      // Cria uma nova cópia do objeto de agendamento para o aparelho
      novoConfigs[indexAparelho] = {
        ...novoConfigs[indexAparelho],
        diasSelecionados: novoDias
      };

      return novoConfigs;
    });

    setDiasVermelhos(prev => {
      const novoDiasVermelhos = [...prev];
      const diasAparelho = novoDiasVermelhos[indexAparelho];
      const novoDias = diasAparelho.includes(diaIndex)
        ? diasAparelho.filter(d => d !== diaIndex)
        : [...diasAparelho, diaIndex];

      novoDiasVermelhos[indexAparelho] = novoDias;
      return novoDiasVermelhos;
    });
  };

  const excluirAgendamento = (index) => {
    setConfigs(prev => {
      const novo = [...prev];
      novo[index] = { nome: '', diasSelecionados: [], horario: '' };
      return novo;
    });

    setDiasVermelhos(prev => {
      const novo = [...prev];
      novo[index] = [];
      return novo;
    });
  };

  const aparelhosAgendados = configs
    .map((config, idx) => ({
      ...config,
      aparelho: aparelhos[idx],
      index: idx
    }))
    .filter(c => c.nome.trim() !== '' && c.diasSelecionados.length > 0 && c.horario !== '');

  return (
    <>
      <div className="timer-container">
        <h1 className="titulo-principal">Agendar</h1>

        <div className="aparelhos-container">
          {aparelhos.map((aparelho, index) => (
            <div
              key={aparelho.id}
              className={`aparelho-card ${aparelho.id === 5 ? 'margem-airfry' : ''}`}
            >
              <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                <img src={aparelho.imagem} alt={`Aparelho ${index + 1}`} className="img-aparelho" />
              </div>

              <div className="aparelho-info">
                <input
                  type="text"
                  placeholder="Nome do aparelho"
                  value={configs[index].nome}
                  onChange={e => {
                    setConfigs(prev => {
                      const novo = [...prev];
                      novo[index] = { ...novo[index], nome: e.target.value };
                      return novo;
                    });
                  }}
                  className="input-nome"
                />

                <input
                  type="time"
                  value={configs[index].horario}
                  onChange={e => {
                    setConfigs(prev => {
                      const novo = [...prev];
                      novo[index] = { ...novo[index], horario: e.target.value };
                      return novo;
                    });
                  }}
                  className="input-horario"
                />

                <div className="dias-container">
                  {diasSemana.map((dia, diaIndex) => {
                    const selecionado = configs[index].diasSelecionados.includes(diaIndex);
                    const vermelho = diasVermelhos[index].includes(diaIndex);

                    return (
                      <div
                        key={diaIndex}
                        className={`dia-bolinha ${selecionado ? (vermelho ? 'selecionado-vermelho' : 'selecionado-preto') : ''}`}
                        title={dia.nome}
                        onClick={() => toggleDia(index, diaIndex)}
                      >
                        {dia.inicial}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {aparelhosAgendados.length > 0 && (
        <>
          <h2 className="titulo-agendamentos">Agendamentos</h2>

          <div className="agendamentos-container">
            {aparelhosAgendados.map(({ aparelho, nome, diasSelecionados, horario, index }) => (
              <div key={index} className="aparelho-card">
                <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                  <img src={aparelho.imagem} alt={nome} className="img-aparelho" />
                </div>

                <div className="aparelho-info">
                  <div className="nome-aparelho">{nome}</div>
                  <div className="info-aparelho">Dias: {diasSelecionados.map(diaIdx => diasSemana[diaIdx].nome).join(', ')}</div>
                  <div className="info-aparelho">Horário: {horario}</div>

                  <button className="btn-excluir" onClick={() => excluirAgendamento(index)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Timer;