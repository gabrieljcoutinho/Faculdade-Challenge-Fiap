import React from 'react';
import '../../CSS/Comandos/comandos.css';

const ComandosChat = () => {
  return (
    <div className="comandos-container">
      <div className='comandoChat'>
        <h3>📢 Comandos no Chat</h3>
      <p className="descricao">
        Para fazer a conexão dos equipamentos via chat, utilize os seguintes comandos:
      </p>
      </div>


      <ul className="lista-comandos">
        <li>
          <strong>Conectar {'{nome do aparelho desejado}'}</strong><br />
          <span className="exemplo">Ex: Conectar TV</span><br />
          ➤ Um aparelho com o nome <strong>TV</strong> aparecerá na seção de conexões.
        </li>
        <br /><br /><br />
        <li>
          <strong>Conectar {'{ícone}'} e {'{nome do aparelho}'}</strong><br />
          <span className="exemplo">
            Ícones disponíveis: <code>Tv</code>, <code>arcondicionado</code>, <code>lâmpada</code>, <code>Airfry</code>, <code>Carregador</code>
          </span><br />
          ➤ O ícone será exibido com o nome escolhido.
        </li>
      </ul>


    </div>
  );
};

export default ComandosChat;
