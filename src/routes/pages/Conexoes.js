import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation } from 'react-router-dom';

// Importa todos os arquivos CSS
import '../../CSS/Conexao/conexao.css';
import '../../CSS/Conexao/mediaScreen.css';
import '../../CSS/Conexao/edit.css';
import '../../CSS/Conexao/saveBtn.css';
import '../../CSS/Conexao/icon.css';
import '../../CSS/Conexao/adicionar.css';
import '../../CSS/Conexao/slideIn.css';
import '../../CSS/Conexao/slideOut.css';
import '../../CSS/Conexao/error.css';
import '../../CSS/Conexao/escolherFundo.css';
import '../../CSS/Conexao/botaoSwitch.css';
import '../../CSS/Conexao/qrCode.css';
import '../../CSS/Conexao/detalhesAparelhos.css';
import '../../CSS/Conexao/imgNaoConectado.css';
import '../../CSS/Conexao/mensagemRemoverAparelho.css';
import '../../CSS/Conexao/mensagemMuitosAprelhosConectadosAoMesmoTempo.css';

// Importa imagens
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import placeholderImage from '../../imgs/semConexao.png';

// Constantes
const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];
const siteBaseURL = "https://challenge-fiap-nine.vercel.app";
const DEVICE_LIMIT = 5; // Define o número máximo de dispositivos

// Configuração dos ícones disponíveis
const availableIcons = [
  { name: 'tv', src: tvIcon },
  { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon },
  { name: 'airfry', src: airfry },
  { name: 'carregador', src: carregador }
];

// Mapa auxiliar para buscar ícones rapidamente pelo nome
const iconMap = availableIcons.reduce((acc, icon) => {
  acc[icon.name] = icon.src;
  return acc;
}, {});

// Componente principal Conexoes
const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  // Estados para controle da UI
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false); // Estado para a busca Bluetooth
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  // Estados para dados do formulário
  const [newConexion, setNewConexion] = useState({
    text: '',
    icon: '',
    backgroundColor: availableColors[0],
    connected: true,
    connectedDate: new Date().toISOString()
  });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  // Efeito para lidar com parâmetros da URL (ex: de leitura de QR code)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('add');
    const iconKey = params.get('icon');

    if (nome && iconKey && iconMap[iconKey]) {
      if (conexions.length >= DEVICE_LIMIT) {
        setShowLimitWarning(true);
      } else {
        // Adiciona o dispositivo automaticamente do QR code, sem busca Bluetooth aqui
        onConnectDevice(nome, nome, iconMap[iconKey], availableColors[0]);
      }
      window.history.replaceState({}, document.title, location.pathname); // Limpa a URL
    }
  }, [location.search, onConnectDevice, conexions.length]);

  // Função auxiliar para obter a chave do ícone pela sua imagem (src)
  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  // --- Funções de Manipulação da UI ---

  const handleAddClick = () => {
    // Reseta o formulário para adicionar um novo dispositivo
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: new Date().toISOString() });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null); // Limpa o estado de edição
    setErrorMessage(''); // Limpa erros anteriores
    setSelectedConexion(null); // Fecha o modal de detalhes
    setShowLimitWarning(false); // Reseta o aviso
    setShowAddForm(true); // Abre o formulário de adição
    setIsSearchingBluetooth(false); // Garante que o estado de busca esteja desligado
  };

  const handleSearchAndConnectBluetooth = async () => {
    // Verifica se o navegador suporta Web Bluetooth
    if (!navigator.bluetooth) {
      setErrorMessage('Seu navegador não suporta Web Bluetooth. Por favor, use Google Chrome, Microsoft Edge ou Opera.');
      return;
    }

    // Verifica o limite de dispositivos antes de iniciar a busca
    if (conexions.length >= DEVICE_LIMIT) {
      setShowLimitWarning(true);
      return;
    }

    setIsSearchingBluetooth(true); // Ativa o estado de busca
    setErrorMessage(''); // Limpa erros anteriores

    try {
      // Isso abrirá uma janela pop-up nativa do navegador para o usuário selecionar um dispositivo.
      // 'acceptAllDevices: true' permite que todos os dispositivos BLE próximos sejam mostrados.
      // Para filtrar por tipos específicos de aparelhos (ex: apenas serviços de bateria), você usaria 'filters'.
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });

      if (device) {
        // Se um dispositivo for selecionado, usamos o nome e tentamos adivinhar um ícone.
        const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';

        // Simples heurística para escolher um ícone baseado no nome
        let guessedIcon = lampIcon; // Ícone padrão
        if (deviceName.toLowerCase().includes('tv')) {
          guessedIcon = tvIcon;
        } else if (deviceName.toLowerCase().includes('ar')) {
          guessedIcon = airConditionerIcon;
        } else if (deviceName.toLowerCase().includes('carregador')) {
          guessedIcon = carregador;
        } else if (deviceName.toLowerCase().includes('airfry')) {
          guessedIcon = airfry;
        }

        // Antes de adicionar, verifica se um dispositivo com esse nome já existe na sua lista
        if (conexions.some(c => c.text.toLowerCase() === deviceName.toLowerCase())) {
          setErrorMessage(`Um aparelho com o nome "${deviceName}" já está conectado.`);
          setIsSearchingBluetooth(false);
          return;
        }

        // Adiciona o dispositivo à sua lista de conexões.
        // Em uma aplicação real, você faria a conexão GATT (device.gatt.connect()) aqui
        // e só adicionaria o dispositivo se a conexão fosse bem-sucedida.
        onConnectDevice(deviceName, deviceName, guessedIcon, availableColors[0]);
        setShowAddForm(false); // Fecha o formulário após a "conexão"
      } else {
        setErrorMessage('Nenhum aparelho Bluetooth selecionado.');
      }
    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      if (error.name === 'NotFoundError') {
        setErrorMessage('Nenhum aparelho Bluetooth encontrado ou selecionado.');
      } else if (error.name === 'NotAllowedError') {
        setErrorMessage('Permissão de Bluetooth negada. Você precisa permitir o acesso.');
      } else if (error.message.includes('User cancelled')) { // Handle user cancelling the dialog
        setErrorMessage('Seleção de aparelho Bluetooth cancelada.');
      }
      else {
        setErrorMessage('Falha na conexão Bluetooth. Tente novamente.');
      }
    } finally {
      setIsSearchingBluetooth(false); // Finaliza o estado de busca, mesmo em caso de erro
    }
  };

  const saveEditedConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) {
      setErrorMessage('Ops! Dê um nome e selecione um ícone para o aparelho 😊');
      return;
    }

    if (conexions.some((c) => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}" 😅`);
      return;
    }

    // Apenas salva a edição, não há necessidade de busca Bluetooth para editar
    setConexions(prev => prev.map(c => c.id === editingId ? { ...newConexion, id: c.id, connectedDate: c.connectedDate } : c));
    setShowAddForm(false);
    setErrorMessage('');
  };


  const removeConexion = (id) => {
    setConexionToDelete(id); // Define o ID da conexão a ser excluída
    setShowConfirmDialog(true); // Mostra o diálogo de confirmação
  };

  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete); // Ativa a animação de saída
      setTimeout(() => {
        onRemoveDevice(conexionToDelete); // Remove o dispositivo
        setRemovingId(null); // Reseta o estado de remoção
        setSelectedConexion(null); // Fecha os detalhes se estiver aberto para este dispositivo
        setConexionToDelete(null); // Limpa o dispositivo a ser excluído
        setShowConfirmDialog(false); // Esconde o diálogo
      }, 300); // Corresponde à duração da transição CSS
    }
  };

  const handleCancelRemove = () => {
    setConexionToDelete(null); // Limpa o dispositivo a ser excluído
    setShowConfirmDialog(false); // Esconde o diálogo
  };

  const handleEditClick = (c) => {
    if (c.connected) {
      setNewConexion({ text: c.text, icon: c.icon, backgroundColor: c.backgroundColor || availableColors[0], connected: c.connected, connectedDate: c.connectedDate });
      setActiveIcon(c.icon);
      setActiveColor(c.backgroundColor || availableColors[0]);
      setEditingId(c.id);
      setErrorMessage('');
      setSelectedConexion(null);
      setShowLimitWarning(false);
      setShowAddForm(true);
      setIsSearchingBluetooth(false); // Garante que o estado de busca esteja desligado para edição
    }
  };

  const toggleConnection = (id) => {
    onToggleConnection(id);
    // Se o dispositivo selecionado for desativado, fecha os detalhes
    const c = conexions.find(device => device.id === id);
    if (selectedConexion && selectedConexion.id === id && c.connected) {
      setSelectedConexion(null);
    }
  };

  const handleConexionClick = (c) => {
    if (c.connected) {
      setSelectedConexion(c); // Mostra os detalhes do dispositivo se conectado
    }
  };

  // --- Funções Auxiliares para Exibição ---

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionDuration = (connectedDateString) => {
    if (!connectedDateString) return 'N/A';
    const connected = new Date(connectedDateString);
    const now = new Date();
    const diff = now - connected; // Diferença em milissegundos

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let duration = [];
    if (days > 0) duration.push(`${days} dia(s)`);
    if (hours % 24 > 0) duration.push(`${hours % 24} hora(s)`);
    if (minutes % 60 > 0 && days === 0) duration.push(`${minutes % 60} minuto(s)`); // Mostra minutos se menos de um dia
    if (seconds % 60 > 0 && hours === 0 && days === 0) duration.push(`${seconds % 60} segundo(s)`); // Mostra segundos se menos de uma hora

    if (duration.length === 0) return 'Menos de um segundo';
    return duration.join(' e ');
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>
      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {/* Imagem de placeholder quando não há conexões */}
      {conexions.length === 0 && !showAddForm && (
        <div className="placeholder-image-container">
          <br /><br /><br />
          <img src={placeholderImage} alt="Nenhum aparelho conectado" className="placeholder-image" />
          <p className="placeholder-text">Nenhum aparelho conectado...</p>
        </div>
      )}

      {/* Modal do Formulário de Adição/Edição */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {/* Renderização condicional para Adicionar vs. Editar */}
            {editingId ? (
              // Editando um aparelho existente: mantém os campos de texto, ícone e cor
              <>
                <input
                  type="text"
                  placeholder="Nome do Aparelho"
                  value={newConexion.text}
                  onChange={(e) => setNewConexion({ ...newConexion, text: e.target.value })}
                />
                <div className="icon-picker-styled">
                  <label>Escolha o ícone:</label>
                  <div className="icons">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon.name}
                        className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                        onClick={() => { setNewConexion({ ...newConexion, icon: icon.src }); setActiveIcon(icon.src); }}
                      >
                        <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className='tipoDoFundoConexao'>Escolha a cor de fundo:</label>
                  <div className="colors">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        className={`color-option ${activeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }}
                      ></button>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={saveEditedConexion} className="save-button-styled">Salvar Edição</button>
                  <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
                </div>
              </>
            ) : (
              // Adicionando um novo aparelho via Bluetooth: mostra apenas o botão de busca
              <>
                <p>Clique no botão abaixo para **procurar e selecionar aparelhos Bluetooth** próximos:</p>
                <button
                  onClick={handleSearchAndConnectBluetooth}
                  className="add-button-styled"
                  disabled={isSearchingBluetooth}
                >
                  {isSearchingBluetooth ? 'Procurando Aparelhos...' : 'Procurar Aparelhos Bluetooth'}
                </button>
                {isSearchingBluetooth && <p className="connecting-message">Aguarde, a janela de seleção do navegador será aberta.</p>}
                <div className="form-actions">
                  <button onClick={() => setShowAddForm(false)} className="cancel-button-styled" disabled={isSearchingBluetooth}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Lista de Aparelhos Conectados */}
      <div className="conexions-list">
        {conexions.map((c) => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''}`}
            style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            onClick={() => handleConexionClick(c)}
          >
            {c.connected && (
              <div className="qrcode-top-left">
                <button className="qrcode-button" onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }}>
                  <img src={imgQrcode} alt="QR Code" className='qrCodeAparelhoConectado' />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
            </div>
            <div className="actions-overlay">
              <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }} disabled={!c.connected}>X</button>
              <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEditClick(c); }} disabled={!c.connected}>
                <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
              </button>
              <div className="switch-container" onClick={(e) => e.stopPropagation()}>
                <label className="switch">
                  <input type="checkbox" checked={c.connected} onChange={() => toggleConnection(c.id)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        ))}
        {/* Div espaçadora para padding inferior consistente */}
        <div style={{ height: '60px' }}></div>
      </div>

      {/* Modal de Exibição de QR Code */}
      {visibleQRCode && (
        <div className="qrcode-overlay">
          <button className="close-qrcode" onClick={() => setVisibleQRCode(null)}>X</button>
          <div className="qrcode-container">
            <h3>Escaneie para Conectar</h3>
            <QRCodeCanvas
              value={`${siteBaseURL}/conexoes?add=${encodeURIComponent(visibleQRCode.text)}&icon=${encodeURIComponent(getIconKeyBySrc(visibleQRCode.icon))}`}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            <p className="qr-code-text">{visibleQRCode.text}</p>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Aparelho */}
      {selectedConexion && (
        <div className="modal-overlay">
          <div className="conexion-details-modal">
            <h2>Detalhes do Aparelho</h2>
            <img src={selectedConexion.icon} alt={selectedConexion.text} style={{ width: '60px', height: '60px' }} />
            <h3>{selectedConexion.text}</h3>
            <p><strong>Conectado em:</strong> {formatDate(selectedConexion.connectedDate)}</p>
            <p><strong>Tempo conectado:</strong> {getConnectionDuration(selectedConexion.connectedDate)}</p>
            <p><strong>ID do aparelho:</strong> <code>{selectedConexion.id}</code></p>
            <button onClick={() => setSelectedConexion(null)} className="close-button-styled">Fechar</button>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmação para Remover */}
      {showConfirmDialog && (
        // <div className="modal-overlay">
        //   <div className="confirmation-dialog">
        //     <h2>Excluir este aparelho?</h2>
        //     <p>Você tem certeza que deseja excluir "{conexions.find(c => c.id === conexionToDelete)?.text}"?</p>
        //     <div className="dialog-actions">
        //       <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
        //       <button onClick={handleCancelRemove} className="cancel-button-styled">Não</button>
        //     </div>
        //   </div>
        // </div>


<div class="modal-overlay">
  <div class="confirmation-dialog">
    <h2>Remover Aparelho</h2>
    <p>Tem certeza que deseja remover este aparelho?</p>
    <div class="dialog-actions">
    <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
      <button onClick={handleCancelRemove} className="cancel-button-styled">Não</button>
    </div>
  </div>
</div>



      )}

      {/* Diálogo de Aviso de Limite de Dispositivos */}
      {showLimitWarning && (
        <div className="modal-overlay">
          <div className="warning-dialog">
            <h2>Aviso!</h2>
            <p>Você atingiu o limite de {DEVICE_LIMIT} aparelhos conectados. Considere desconectar alguns para adicionar novos.</p>
            <button onClick={() => setShowLimitWarning(false)} className="close-button-styled">Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;