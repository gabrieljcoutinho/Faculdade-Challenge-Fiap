import React, { useState } from 'react';
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

const Timer = () => {
  const [configs, setConfigs] = useState(
    aparelhos.map(() => ({
      nome: '',
      diasSelecionados: [],
      horario: ''
    }))
  );

  const [diasVermelhos, setDiasVermelhos] = useState(
    aparelhos.map(() => [])
  );

  const toggleDia = (indexAparelho, diaIndex) => {
    setConfigs(prevConfigs => {
      const novoConfigs = [...prevConfigs];
      const diasAtuais = novoConfigs[indexAparelho].diasSelecionados;

      if (diasAtuais.includes(diaIndex)) {
        return prevConfigs;
      } else {
        novoConfigs[indexAparelho].diasSelecionados = [...diasAtuais, diaIndex];
        return novoConfigs;
      }
    });

    setDiasVermelhos(prev => {
      const novoDiasVermelhos = [...prev];
      const diasAparelho = novoDiasVermelhos[indexAparelho];

      if (diasAparelho.includes(diaIndex)) {
        novoDiasVermelhos[indexAparelho] = diasAparelho.filter(d => d !== diaIndex);
      } else {
        novoDiasVermelhos[indexAparelho] = [...diasAparelho, diaIndex];
      }
      return novoDiasVermelhos;
    });
  };

  const excluirAgendamento = (index) => {
    setConfigs(prev => {
      const novo = [...prev];
      novo[index] = {
        nome: '',
        diasSelecionados: [],
        horario: ''
      };
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
        <h1>Agendar</h1>

        <div className="aparelhos-container">
          {aparelhos.map((aparelho, index) => (
            <div key={aparelho.id} className="aparelho-card">
              <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                <img
                  src={aparelho.imagem}
                  alt={`Aparelho ${index + 1}`}
                  className="img-aparelho"
                />
              </div>

              <div className="aparelho-info">
                <input
                  type="text"
                  placeholder="Nome do aparelho"
                  value={configs[index].nome}
                  onChange={e => {
                    const novoNome = e.target.value;
                    setConfigs(prev => {
                      const novo = [...prev];
                      novo[index].nome = novoNome;
                      return novo;
                    });
                  }}
                  className="input-nome"
                />

                <input
                  type="time"
                  value={configs[index].horario || ''}
                  onChange={e => {
                    const novoHorario = e.target.value;
                    setConfigs(prev => {
                      const novo = [...prev];
                      novo[index].horario = novoHorario;
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
                        className={`dia-bolinha ${
                          selecionado ? (vermelho ? 'selecionado-vermelho' : 'selecionado-preto') : ''
                        }`}
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
          <h2 style={{ textAlign: 'center', marginTop: '30px', color: '#333' }}>Agendamentos</h2>
          <div style={{
            backgroundColor: 'black',
            padding: '20px',
            borderRadius: '12px',
            margin: '20px auto',
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center',
            paddingBottom: '10rem'
          }}>
            {aparelhosAgendados.map(({ aparelho, nome, diasSelecionados, horario, index }) => (
              <div key={index} className="aparelho-card">
                <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                  <img
                    src={aparelho.imagem}
                    alt={nome}
                    className="img-aparelho"
                  />
                </div>

                <div className="aparelho-info">
                  <div
                    style={{
                      width: '100%',
                      marginBottom: '12px',
                      fontWeight: '700',
                      fontSize: '15px',
                      color: '#fff',
                      textAlign: 'center'
                    }}
                  >
                    {nome}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      marginBottom: '18px',
                      fontSize: '14px',
                      color: '#ccc',
                      textAlign: 'center'
                    }}
                  >
                    Dias: {diasSelecionados.map(diaIdx => diasSemana[diaIdx].nome).join(', ')}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      color: '#ccc',
                      textAlign: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    Horário: {horario}
                  </div>

                  <button
                    onClick={() => excluirAgendamento(index)}
                    style={{
                      cursor: 'pointer',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#e53935',
                      color: 'white',
                      fontWeight: '600',
                      width: '100%'
                    }}
                    title="Excluir agendamento"
                  >
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
