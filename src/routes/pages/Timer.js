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
    aparelhos.map(() => ({ nome: '', diasSelecionados: [], horario: '' }))
  );

  const [diasVermelhos, setDiasVermelhos] = useState(
    aparelhos.map(() => [])
  );

  const toggleDia = (indexAparelho, diaIndex) => {
    setConfigs(prevConfigs => {
      const novoConfigs = [...prevConfigs];
      const diasAtuais = novoConfigs[indexAparelho].diasSelecionados;

      if (!diasAtuais.includes(diaIndex)) {
        novoConfigs[indexAparelho].diasSelecionados = [...diasAtuais, diaIndex];
      }
      return novoConfigs;
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
            <div key={aparelho.id} className="aparelho-card">
              <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                <img src={aparelho.imagem} alt={`Aparelho ${index + 1}`} className="img-aparelho" />
              </div>

              <div className="aparelho-info">
                <input
                  type="text"
                  placeholder="Nome do aparelho"
                  value={configs[index].nome}
                  onChange={e => {
                    const novo = [...configs];
                    novo[index].nome = e.target.value;
                    setConfigs(novo);
                  }}
                  className="input-nome"
                />

                <input
                  type="time"
                  value={configs[index].horario}
                  onChange={e => {
                    const novo = [...configs];
                    novo[index].horario = e.target.value;
                    setConfigs(novo);
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
