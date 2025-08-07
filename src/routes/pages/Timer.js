import React from 'react';
import '../../CSS/Timer/index.css'

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

const Timer = ({ aparelhos, setAparelhos }) => {
  const handleToggleDia = (aparelhoId, diaIndex) => {
    setAparelhos(prevAparelhos =>
      prevAparelhos.map(aparelho => {
        if (aparelho.id === aparelhoId) {
          const agendamentoExistente = aparelho.agendamentos.length > 0 ? { ...aparelho.agendamentos[0] } : { dias: [], horario: '' };

          const diasAtuais = agendamentoExistente.dias;
          const novoDias = diasAtuais.includes(diaIndex)
            ? diasAtuais.filter(d => d !== diaIndex)
            : [...diasAtuais, diaIndex];

          const novoAgendamento = { ...agendamentoExistente, dias: novoDias };
          return { ...aparelho, agendamentos: [novoAgendamento] };
        }
        return aparelho;
      })
    );
  };

  const handleUpdateHorario = (aparelhoId, horario) => {
    setAparelhos(prevAparelhos =>
      prevAparelhos.map(aparelho => {
        if (aparelho.id === aparelhoId) {
          const agendamentoExistente = aparelho.agendamentos.length > 0 ? { ...aparelho.agendamentos[0] } : { dias: [], horario: '' };
          const novoAgendamento = { ...agendamentoExistente, horario };
          return { ...aparelho, agendamentos: [novoAgendamento] };
        }
        return aparelho;
      })
    );
  };

  const handleExcluirAgendamento = (aparelhoId) => {
    setAparelhos(prevAparelhos =>
      prevAparelhos.map(aparelho =>
        aparelho.id === aparelhoId
          ? { ...aparelho, agendamentos: [] }
          : aparelho
      )
    );
  };

  const aparelhosComAgendamento = aparelhos.filter(a => a.agendamentos.length > 0 && a.agendamentos[0].horario);

  return (
    <>
      <div className="timer-container">
        <h1 className="titulo-principal">Agendar</h1>
        <div className="aparelhos-container">
          {aparelhos.map(aparelho => {
            const agendamento = aparelho.agendamentos[0] || { dias: [], horario: '' };
            return (
              <div key={aparelho.id} className={`aparelho-card ${aparelho.id === 5 ? 'margem-airfry' : ''}`}>
                <div className="aparelho-img-bg" style={{ backgroundColor: aparelho.corFundo }}>
                  <img src={aparelho.imagem} alt={aparelho.nome} className="img-aparelho" />
                </div>
                <div className="aparelho-info">
                  <input
                    type="text"
                    placeholder="Nome do aparelho"
                    value={aparelho.nome}
                    readOnly
                    className="input-nome"
                  />
                  <input
                    type="time"
                    value={agendamento.horario}
                    onChange={e => handleUpdateHorario(aparelho.id, e.target.value)}
                    className="input-horario"
                  />
                  <div className="dias-container">
                    {diasSemana.map((dia, diaIndex) => {
                      const selecionado = agendamento.dias.includes(diaIndex);
                      return (
                        <div
                          key={diaIndex}
                          className={`dia-bolinha ${selecionado ? 'selecionado-preto' : ''}`}
                          title={dia.nome}
                          onClick={() => handleToggleDia(aparelho.id, diaIndex)}
                        >
                          {dia.inicial}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {aparelhosComAgendamento.length > 0 && (
        <>
          <h2 className="titulo-agendamentos">Agendamentos</h2>
          <div className="agendamentos-container">
            {aparelhosComAgendamento.map(({ imagem, nome, agendamentos, corFundo, id }) => (
              <div key={id} className="aparelho-card">
                <div className="aparelho-img-bg" style={{ backgroundColor: corFundo }}>
                  <img src={imagem} alt={nome} className="img-aparelho" />
                </div>
                <div className="aparelho-info">
                  <div className="nome-aparelho">{nome}</div>
                  <div className="info-aparelho">
                    Dias: {agendamentos[0].dias.map(diaIdx => diasSemana[diaIdx].nome).join(', ')}
                  </div>
                  <div className="info-aparelho">
                    Horário: {agendamentos[0].horario}
                  </div>
                  <button className="btn-excluir" onClick={() => handleExcluirAgendamento(id)}>
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