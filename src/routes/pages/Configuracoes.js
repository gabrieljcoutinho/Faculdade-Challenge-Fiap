import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Settings/setting.css';

const Configuracoes = () => {
    const navigate = useNavigate();

    const fecharConfiguracoes = () => {
        navigate('/');
    };

    const navegarParaLogin = () => {
        navigate('/login'); // Defina a rota para o seu componente Logar
    };

    return (
        <div className="configuracoes-overlay">
            <button className="fechar-btn" onClick={fecharConfiguracoes}>✕</button>
            <div className="conteudo-configuracoes">
                <h1 className='settingTitulo'>Configurações</h1>
                <div className="btn-container">
                    <button title="Logar" onClick={navegarParaLogin}>Log In</button>
                    <button title="Deslogar">Log out</button>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;