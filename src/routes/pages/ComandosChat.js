import React from 'react';
import '../../CSS/Comandos/comandos.css';

const ComandosChat = () => {
  return (
    <div className="comandos-page-wrapper"> {/* Added a wrapper for consistent padding/margin */}
    <br /><br /><br />
      <h3 className="comando-header">📢 Comandos no Chat</h3>

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
                '➤ Analisar grafico ',
                '➤ Analisar o grafico ',
                '➤ Analise Gráfico ',
                '➤ Analise o Gráfico ',
                '➤ Analise Grafico ',
                '➤ Analise o Grafico ',
                '➤ Analise do grafico ',
                '➤ Analise do gráfico ',
                '➤ Analise do Gráfico ',
                '➤ Analise do Grafico ',
                '➤ Análise Gráfico ',
                '➤ Análise Grafico ',
                '➤ Análise o Grafico ',
                '➤ Análise do grafico ',
                '➤ Análise do gráfico ',
                '➤ Análise do Gráfico ',
                '➤ Análise do Grafico ',
                '➤ Relatório de produção ',
                '➤ Relatório de produção do gráfico ',
                '➤ Relatório de produção do Gráfico ',
                '➤ Relatório de produção do grafico ',
                '➤ Relatório de produção do Grafico ',
                '➤ Dados do gráfico ',
                '➤ Dados do Gráfico ',
                '➤ Dados do grafico ',
                '➤ Dados do Grafico ',
                '➤ Producao de energia ',
                '➤ Producao de energia do gráfico ',
                '➤ Producao de energia do Gráfico ',
                '➤ Producao de energia do grafico ',
                '➤ Producao de energia do Grafico ',
                '➤ Produção de energia ',
                '➤ Produção de energia do gráfico ',
                '➤ Produção de energia do Gráfico ',
                '➤ Produção de energia do grafico ',
                '➤ Produção de energia do Grafico ',
                '➤ Meus dados de energia ',
                '➤ Meus dados de energia do gráfico ',
                '➤ Meus dados de energia do Gráfico ',
                '➤ Meus dados de energia do grafico ',
                '➤ Meus dados de energia do Grafico ',
                '➤ Como esta a energia ',
                '➤ Como está a energia do gráfico ',
                '➤ Como está a energia do Gráfico ',
                '➤ Como está a energia do grafico ',
                '➤ Como está a energia do Grafico ',
                '➤ Como esta a energia do gráfico ',
                '➤ Como esta a energia do Gráfico ',
                '➤ Como esta a energia do grafico ',
                '➤ Como esta a energia do Grafico',
                '➤ Informação do gráfico',
                '➤ Informações do gráfico',
                '➤ Informação do grafico',
                '➤ Informações do grafico'



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