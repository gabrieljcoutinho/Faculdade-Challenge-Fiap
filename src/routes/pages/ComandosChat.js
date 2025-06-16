import React from 'react';
import '../../CSS/Comandos/comandos.css';

const ComandosChat = () => {
  return (
    <div className="comandos-page-wrapper"> {/* Added a wrapper for consistent padding/margin */}
    <br /><br /><br />
      <h3 className="comando-header">📢 Comandos do Chat</h3>

      <div className="comandos-container">
        <p className="comandos-description">
          Para fazer a conexão dos equipamentos via chat, utilize os seguintes comandos:
        </p>

        <ul className="lista-comandos">
          <li className="comando-item">
            <strong>Conectar {'{nome do aparelho}'}</strong>
             <strong>Ligar {'{nome do aparelho}'}</strong>
            <span className="comando-example">Ex: Conectar TV</span>
            <p className="comando-explanation">
              ➤ Um aparelho com o nome <strong>TV</strong> aparecerá na seção de conexões.
            </p>
          </li>

          <li className="comando-item">
            <strong>Conectar {'{ícone}'} e {'{nome do aparelho}'}</strong>
            <span className="comando-example">
              Ícones disponíveis: <code>Tv</code>, <code>arcondicionado</code>, <code>lâmpada</code>, <code>Airfry</code>, <code>Carregador</code>
            </span>
            <p className="comando-explanation">
              ➤ O ícone será exibido com o nome escolhido.
            </p>
          </li>

          <li className="comando-item">
            <strong>Análise de Gráfico: Comandos</strong>
            <ul className="sub-lista-comandos">
              {/* Grouped common phrases for better readability */}
              {[
                '➤ Analisar gráfico ',
                '➤ Analisar o gráfico ',


                '➤ Relatório de produção ',
                '➤ Relatório de produção do gráfico ',


                '➤ Dados do gráfico ',
                '➤ Dados do Gráfico ',


                '➤ Producao de energia ',
                '➤ Producao de energia do gráfico ',

                '➤ Meus dados de energia ',
                '➤ Meus dados de energia do gráfico ',


                '➤ Como esta a energia ',
                '➤ Como está a energia do gráfico ',


                  '➤ Como tá a produção de energia ?',
                  '➤ Como tá a produção de energia',


                '➤ Informação do gráfico',
                '➤ Informações do gráfico',




              ].map((command, index) => (
                <li key={index}>{command}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <br />
    </div>
  );
};

export default ComandosChat;