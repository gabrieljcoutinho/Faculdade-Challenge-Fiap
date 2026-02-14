import React from 'react';
import '../../CSS/Comandos/estruturaGeral.css';
import '../../CSS/Comandos/header.css';
import '../../CSS/Comandos/container.css';
import '../../CSS/Comandos/description.css';
import '../../CSS/Comandos/comandoItem.css';
import '../../CSS/Comandos/comandoExample.css';
import '../../CSS/Comandos/comandoExplicacao.css';
import '../../CSS/Comandos/subListaComandos.css';
import '../../CSS/Comandos/ulReset.css';

import { tituloPrincipal, subTitulo, exemploMensagemChat, comandoAnlisarGrafico } from '../../constants/ComandosChat/index.js';

const comandos = [
  {
    title: <>Conectar {'{nome do aparelho}'}<br />Ligar {'{nome do aparelho}'}</>,
    example: 'Ex: Conectar TV',
    explanation: ''
  },
  {
    title: <>Conectar {'{ícone}'} e {'{nome do aparelho}'}</>,
    example: <>Ícones disponíveis: <code>Tv</code>, <code>arcondicionado</code>, <code>lâmpada</code>, <code>Airfry</code>, <code>Carregador</code></>,
    explanation: exemploMensagemChat
  },
  {
    title: comandoAnlisarGrafico,
    subcommands: [
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
    ]
  },
  {
    title: 'Tema Claro',
    subcommands: [
      '➤ Mudar para o modo claro',
      '➤ Ativar modo claro',
      '➤ Modo claro',
      '➤ Tema claro',
      '➤ mudar para o modo claro',
      '➤ ativar modo claro',
      '➤ modo claro, tema claro',
    ]
  },
  {
    title: 'Tema Escuro',
    subcommands: [
      '➤ Mudar para o modo escuro',
      '➤ Ativar modo escuro',
      '➤ Modo escuro',
      '➤ Tema escuro',
      '➤ mudar para o modo escuro',
      '➤ ativar modo escuro',
      '➤ modo escuro',
      '➤ tema escuro',
    ]
  },
  {
    title: 'Troca de página',
    subcommands: [
      '➤ Ir para a página inicial',
      '➤ Ir para conexões',
      '➤ Ir para configurações',
      '➤ Ir para contato ',
      '➤ Ir para ajuda',
      '➤ Ir para perguntas frequentes',
      '➤ Ir para comandos do chat'
    ]
  },

  {
    title: 'Troca bateria/energia elétrica',
    subcommands: [
      '➤ Usar bateria',
      '➤ Modo bateria',
      '➤ Usar energia elétrica',
      '➤ Usar cabo',
      '➤ Ativar cabo'
    ]
  },

    {
    title: 'Leitor de tela do Chat',
    subcommands: [
      '➤ modo de fala',
      '➤ desativar modo de fala'


    ]
  }


];

const ComandosChat = () => (
  <div className="comandos-page-wrapper">
    <br /><br /><br />
    <h3 className="comando-header">{tituloPrincipal}</h3>
    <div className="comandos-container">
      <p className="comandos-description">{subTitulo}</p>
      <ul className="lista-comandos">
        {comandos.map(({ title, example, explanation, subcommands }, i) => (
          <li key={i} className="comando-item">
            <strong>{title}</strong>
            {example && <span className="comando-example">{example}</span>}
            {explanation && <p className="comando-explanation">{explanation}</p>}
            {subcommands && (
              <ul className="sub-lista-comandos">
                {subcommands.map((cmd, i2) => <li key={i2}>{cmd}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
    <br />
  </div>
);

export default ComandosChat;
