import React from 'react'
import '../../CSS/Conquista/index.css'

import imgEntrada from '../../imgs/Medalhas/1-entrouNaPáginaPelaPrimeraVez.png'
import imgGrafico from '../../imgs/Medalhas/2-grafico.png'
import secoes from '../../imgs/Medalhas/3-acesouTodasAsSecoesDaPaginaPeloMenosUmaVez.png'
import relatorio from '../../imgs/Medalhas/4-visualizouoRelatorioDiarioDoGRafico.png'
import conexao from '../../imgs/Medalhas/5-conectou UMaprelhoPelaPrimeriaVez.png'
import excluiu from '../../imgs/Medalhas/6-excluiuUmAparelhoPelaPrimeraVez.png'
import compartilhar from '../../imgs/Medalhas/7-acessouOqrcodePElaPriemraVez.png'
import chat from '../../imgs/Medalhas/8-acessouOchatPelaPriemraVez.png'
import goodwe from '../../imgs/Medalhas/9-clicouNoLogoDaEmpresa.png'
import tema from '../../imgs/Medalhas/10-mudouOtemDaPagina.png'
import acessibilidade from '../../imgs/Medalhas/11-acessibilidade.png'
import tudo from '../../imgs/Medalhas/12-pegouTodasAsConquistas.png'

const Conquista = () => {
  return (
    <div className='conquista'>
      <h1>Conquistas</h1>
      <div className="conquistas-container">
        <img src={imgEntrada} alt="" />
        <img src={imgGrafico} alt="" />
        <img src={secoes} alt="" />
        <img src={relatorio} alt="" />
        <img src={conexao} alt="" />
        <img src={excluiu} alt="" />
        <img src={compartilhar} alt="" />
        <img src={chat} alt="" />
        <img src={goodwe} alt="" />
        <img src={tema} alt="" />
        <img src={acessibilidade} alt="" />
        <img src={tudo} alt="" />
      </div>
    </div>
  )
}

export default Conquista
