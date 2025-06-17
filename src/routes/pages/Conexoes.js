import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Importing CSS files for styling
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
import '../../CSS/Conexao/imgAntesDeConectarAparelho.css';
import '../../CSS/Conexao/chatAnimation.css'; // New CSS for chat-added animation
import '../../CSS/Conexao/deviceDetailsModal.css'; // New CSS for device details modal

// Importing images for icons and UI elements
import tvIcon from '../../imgs/TV.png';
import airConditionerIcon from '../../imgs/ar-condicionado.png';
import airfry from '../../imgs/airfry.png';
import lampIcon from '../../imgs/lampada.png';
import carregador from '../../imgs/carregador.png';
import editIcon from '../../imgs/pencil.png';
import imgQrcode from '../../imgs/qrCode.png';
import connectDeviceImage from '../../imgs/imgConectarAppAntesdeSairDaTela.png';

// Available background colors for connections
const availableColors = ['#FFEBCD', '#E0FFFF', '#FFE4E1', '#FFDAB9', '#B0E0E6', '#00FFFF', '#EEE8AA', '#E6E6FA', '#F0F8FF'];

const Conexoes = () => {
  // Array of available icons for devices with a unique 'id'
  const availableIcons = [
    { id: 'tv', name: 'TV', src: tvIcon },
    { id: 'airConditioner', name: 'Ar Condicionado', src: airConditionerIcon },
    { id: 'lamp', name: 'Lâmpada', src: lampIcon },
    { id: 'airfry', name: 'Airfry', src: airfry },
    { id: 'charger', name: 'Carregador', src: carregador }
  ];

  // Helper to find icon src by its ID
  const getIconSrcById = (iconId) => {
    const icon = availableIcons.find(i => i.id === iconId);
    return icon ? icon.src : tvIcon; // Default to tvIcon if not found
  };

  // Helper to find icon ID by its src
  const getIconIdBySrc = (iconSrc) => {
    const icon = availableIcons.find(i => i.src === iconSrc);
    return icon ? icon.id : 'tv'; // Default to 'tv' if not found
  };

  // Helper to find icon name by its src (new helper)
  const getIconNameBySrc = (iconSrc) => {
    const icon = availableIcons.find(i => i.src === iconSrc);
    return icon ? icon.name : 'Desconhecido';
  };

  // State to manage the list of connected devices
  const [conexions, setConexions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('conexions'));
      // Ensure stored connections use a valid icon src if coming from old format
      return Array.isArray(stored) ? stored.map(c => ({
        ...c,
        icon: getIconSrcById(getIconIdBySrc(c.icon)), // Re-map to ensure valid src
        connectedDate: c.connectedDate || new Date().toISOString(), // Ensure connectedDate exists
        // Initialize lastStatusChange for existing items if it doesn't exist
        lastStatusChange: c.lastStatusChange || new Date().toISOString(),
        // Initialize connectedDuration and disconnectedDuration
        connectedDuration: c.connectedDuration || 0,
        disconnectedDuration: c.disconnectedDuration || 0
      })) : [];
    } catch {
      return [];
    }
  });

  // State to control the visibility of the add/edit form
  const [showAddForm, setShowAddForm] = useState(false);
  // State for the new device being added or edited
  const [newConexion, setNewConexion] = useState({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: '', lastStatusChange: '', connectedDuration: 0, disconnectedDuration: 0 });
  // State to track the active icon selected in the form (now uses src directly for display)
  const [activeIcon, setActiveIcon] = useState(null);
  // State to track the active background color selected in the form
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  // State to hold the index of the device being edited
  const [editingIndex, setEditingIndex] = useState(null);
  // State for displaying error messages in the form
  const [errorMessage, setErrorMessage] = useState('');
  // State to track the index of the device being removed for animation
  const [removingIndex, setRemovingIndex] = useState(null);
  // State to manage 'entering' animations for new devices
  const [enteringMap, setEnteringMap] = useState({});
  // State to control the visibility of the QR code modal
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  // New state to track the ID of a device added via chat (URL parameter)
  const [chatAddedDevice, setChatAddedDevice] = useState(null);
  // NEW STATE: To manage the visibility and content of the device details modal
  const [showDeviceDetails, setShowDeviceDetails] = useState(null); // Will hold the device object when open, null when closed

  // Effect to save connections to localStorage whenever `conexions` changes
  useEffect(() => {
    localStorage.setItem('conexions', JSON.stringify(conexions));
  }, [conexions]);

  // Effect to check for 'add', 'iconId', and 'bgColor' parameters in the URL for chat-initiated connections
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aparelhoParaAdicionar = params.get('add');
    const iconIdParaAdicionar = params.get('iconId'); // Get the icon ID parameter
    const bgColorParaAdicionar = params.get('bgColor'); // Get the background color parameter

    if (aparelhoParaAdicionar) {
      // Check if the device already exists to avoid duplicates
      const jaExiste = conexions.some(c => c.text.toLowerCase() === aparelhoParaAdicionar.toLowerCase());
      if (!jaExiste) {
        // Determine the icon source to use based on the iconId
        const iconSrc = getIconSrcById(iconIdParaAdicionar);

        // Determine the background color. Use if it's one of the available colors, else default.
        const finalBgColor = availableColors.includes(bgColorParaAdicionar)
          ? bgColorParaAdicionar
          : availableColors[0]; // Default color

        const now = new Date().toISOString();
        // Create a new device object with a unique ID and chat-added flag
        const novo = {
          id: Date.now(), // Assign a unique ID for React keys and animation tracking
          text: aparelhoParaAdicionar,
          icon: iconSrc, // Use the extracted or default icon src
          backgroundColor: finalBgColor, // Use the extracted or default background color
          connected: true,
          addedViaChat: true, // Flag to indicate it was added via chat
          connectedDate: now, // Store the current date and time
          lastStatusChange: now, // Initialize last status change to now
          connectedDuration: 0, // Initialize connected duration
          disconnectedDuration: 0 // Initialize disconnected duration
        };
        setConexions(prev => [...prev, novo]);
        setChatAddedDevice(novo.id); // Set the ID of the newly chat-added device
        // Optionally, remove the 'add', 'iconId', and 'bgColor' parameters from the URL after processing
        // const newUrl = new URL(window.location.href);
        // newUrl.searchParams.delete('add');
        // newUrl.searchParams.delete('iconId');
        // newUrl.searchParams.delete('bgColor');
        // window.history.replaceState({}, document.title, newUrl.toString());
      }
    }
  }, [conexions]); // Added conexions to dependency array to re-run effect if connections change (e.g., manual add)

  // Handles click on the "Add Device" button
  const handleAddClick = () => {
    setShowAddForm(true); // Show the add form
    const now = new Date().toISOString();
    setNewConexion({ text: '', icon: '', backgroundColor: availableColors[0], connected: true, connectedDate: now, lastStatusChange: now, connectedDuration: 0, disconnectedDuration: 0 }); // Reset new connection state and set current date
    setActiveIcon(null); // Reset active icon
    setActiveColor(availableColors[0]); // Reset active color
    setEditingIndex(null); // Clear editing index
    setErrorMessage(''); // Clear any previous error messages
    setChatAddedDevice(null); // Reset chat-added device when manually adding
    setShowDeviceDetails(null); // Ensure details modal is closed
  };

  // Saves a new or edited connection
  const saveConexion = () => {
    // Input validation
    if (!newConexion.text || !newConexion.icon) {
      setErrorMessage('Ops! Para adicionar um aparelho, você precisa dar um nome e escolher um ícone para ele, tá? 😉');
      return;
    }
    // Check for duplicate names
    if (conexions.some((c, i) => c.text.toLowerCase() === newConexion.text.toLowerCase() && i !== editingIndex)) {
      setErrorMessage(`Hummm, parece que já temos um aparelho chamado "${newConexion.text}" por aqui. Que tal escolher outro nome? 😊`);
      return;
    }

    if (editingIndex !== null) {
      // If editing an existing connection
      const updated = [...conexions];
      updated[editingIndex] = {
        ...newConexion,
        connectedDate: updated[editingIndex].connectedDate || new Date().toISOString(),
        lastStatusChange: updated[editingIndex].lastStatusChange || new Date().toISOString(),
        connectedDuration: updated[editingIndex].connectedDuration || 0,
        disconnectedDuration: updated[editingIndex].disconnectedDuration || 0
      }; // Preserve existing date or add new
      setConexions(updated);
    } else {
      // If adding a new connection
      const now = new Date().toISOString();
      const newDevice = {
        ...newConexion,
        id: Date.now(),
        addedViaChat: false,
        connectedDate: now,
        lastStatusChange: now, // Set initial last status change
        connectedDuration: 0,
        disconnectedDuration: 0
      }; // Assign unique ID and mark as not chat-added, set current date
      setConexions((prev) => [...prev, newDevice]); // Add to the list
      setEnteringMap((prev) => ({ ...prev, [newDevice.id]: true })); // Trigger 'entering' animation for this new device
      // Remove the 'entering' class after animation completes
      setTimeout(() => {
        setEnteringMap((prev) => {
          const updated = { ...prev };
          delete updated[newDevice.id];
          return updated;
        });
      }, 300);
    }
    setShowAddForm(false); // Hide the form after saving
  };

  // Removes a connection
  const removeConexion = (index) => {
    // Only allow removal if the device is connected
    if (conexions[index].connected) {
      setRemovingIndex(index); // Set index for 'exiting' animation
      // Remove after animation completes
      setTimeout(() => {
        setConexions((prev) => prev.filter((_, i) => i !== index));
        setRemovingIndex(null);
        setShowDeviceDetails(null); // Close details modal if the removed device was being viewed
      }, 300);
    }
  };

  // Handles click on the "Edit" button
  const handleEditClick = (index) => {
    // Only allow editing if the device is connected
    if (conexions[index].connected) {
      const c = conexions[index];
      // Populate the form with current device data
      setNewConexion({
        text: c.text,
        icon: c.icon,
        backgroundColor: c.backgroundColor || availableColors[0],
        connected: c.connected !== undefined ? c.connected : true,
        connectedDate: c.connectedDate || new Date().toISOString(), // Ensure date is carried over
        lastStatusChange: c.lastStatusChange || new Date().toISOString(),
        connectedDuration: c.connectedDuration || 0,
        disconnectedDuration: c.disconnectedDuration || 0
      });
      setActiveIcon(c.icon); // Set active icon in picker
      setActiveColor(c.backgroundColor || availableColors[0]); // Set active color in picker
      setShowAddForm(true); // Show the form
      setEditingIndex(index); // Set editing index
      setErrorMessage(''); // Clear any previous error messages
      setChatAddedDevice(null); // Reset chat-added device when editing
      setShowDeviceDetails(null); // Ensure details modal is closed
    }
  };

  // Toggles the connection status of a device
  const toggleConnection = (index) => {
    setConexions(prevConexions => prevConexions.map((c, i) => {
      if (i === index) {
        const now = Date.now();
        const duration = now - new Date(c.lastStatusChange).getTime();

        return {
          ...c,
          connected: !c.connected,
          lastStatusChange: new Date(now).toISOString(),
          connectedDuration: c.connected ? c.connectedDuration + duration : c.connectedDuration,
          disconnectedDuration: !c.connected ? c.disconnectedDuration + duration : c.disconnectedDuration
        };
      }
      return c;
    }));
  };

  // NEW HANDLER: To show device details
  const handleDeviceCardClick = (device) => {
    // Only show details if the device is connected
    if (device.connected) {
      setShowDeviceDetails(device);
    }
  };

  // Helper to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to format duration for display
  const formatDuration = (milliseconds) => {
    if (milliseconds === undefined || milliseconds === null) return 'N/A';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}, ${hours % 24} hora${(hours % 24) !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}, ${minutes % 60} minuto${(minutes % 60) !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds % 60} segundo${(seconds % 60) !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>
      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingIndex !== null ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <input
              type="text"
              placeholder="Nome do Aparelho"
              value={newConexion.text}
              onChange={(e) => setNewConexion({ ...newConexion, text: e.target.value })}
            />
            {/* Icon Picker */}
            <div className="icon-picker-styled">
              <label>Escolha o ícone:</label>
              <div className="icons">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.id} // Use icon.id as key
                    className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                    onClick={() => {
                      setNewConexion({ ...newConexion, icon: icon.src });
                      setActiveIcon(icon.src);
                    }}
                    title={icon.name}
                  >
                    <img src={icon.src} alt={icon.name} style={{ width: '30px', height: '30px' }} />
                  </button>
                ))}
              </div>
            </div>
            {/* Color Picker */}
            <div className="color-picker-styled">
              <label className='tipoDoFundoConexao'>Escolha a cor de fundo:</label>
              <div className="colors">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${activeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setNewConexion({ ...newConexion, backgroundColor: color });
                      setActiveColor(color);
                    }}
                    title={color}
                  ></button>
                ))}
              </div>
            </div>
            {/* Form Actions */}
            <div className="form-actions">
              <button
                onClick={saveConexion}
                className="save-button-styled"
                disabled={!newConexion.text || !newConexion.icon}
              >
                {editingIndex !== null ? 'Salvar Edição' : 'Salvar'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-button-styled">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional rendering for no devices or list of devices */}
      {conexions.length === 0 ? (
        <div className="no-devices-container">
          <img src={connectDeviceImage} alt="Conectar aparelho" className="connect-device-image" />
          <p className="connect-device-text">Não há aparelhos conectados</p>
        </div>
      ) : (
        <div className="conexions-list">
          {conexions.map((c, index) => {
            const isRemoving = removingIndex === index;
            // Check if this device is currently 'entering' (manual add animation)
            const isEntering = enteringMap[c.id];
            // Check if this device was added via chat for its specific animation
            const isChatAdded = c.id === chatAddedDevice;

            return (
              <div
                key={c.id || `${c.text}-${index}`} // Use unique ID as key for better list performance
                className={`retanguloAdicionado ${isRemoving ? 'exiting' : ''} ${isEntering ? 'entering' : ''} ${isChatAdded ? 'entering-from-chat' : ''}`}
                style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
                onClick={() => handleDeviceCardClick(c)} // NEW: Click handler for the device card
              >
                {/* QR Code Button (visible only if connected) */}
                {c.connected && (
                  <div className="qrcode-top-left">
                    <button
                      className="qrcode-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        setVisibleQRCode(index); // Show QR code for this device
                      }}
                      title="Gerar QR Code"
                    >
                      <img src={imgQrcode} alt="QR Code" className='qrCodeAparelhoConectado' />
                    </button>
                  </div>
                )}

                {/* Disconnected overlay */}
                {!c.connected && <div className="disconnected-overlay">Desativado</div>}

                {/* Device Icon and Text */}
                <div className="icon-text-overlay">
                  <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
                  <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
                </div>

                {/* Action Buttons (Remove, Edit, Toggle Switch) */}
                <div className="actions-overlay">
                  <button
                    className="remove-button"
                    onClick={(e) => { e.stopPropagation(); removeConexion(index); }} // Prevent card click
                    title="Remover"
                    disabled={!c.connected} // Disable if disconnected
                    style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                  >
                    X
                  </button>

                  <button
                    className="edit-button"
                    onClick={(e) => { e.stopPropagation(); handleEditClick(index); }} // Prevent card click
                    title="Editar"
                    disabled={!c.connected} // Disable if disconnected
                    style={{ cursor: !c.connected ? 'not-allowed' : 'pointer', opacity: !c.connected ? 0.5 : 1 }}
                  >
                    <img src={editIcon} alt="Editar" style={{ width: '18px', height: '18px' }} />
                  </button>

                  <div className="switch-container" onClick={(e) => e.stopPropagation()}> {/* Prevent card click */}
                    <label className="switch">
                      <input type="checkbox" checked={c.connected} onChange={() => toggleConnection(index)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ height: '60px' }}></div> {/* Spacer for bottom content */}
        </div>
      )}

      {/* QR Code Modal */}
      {visibleQRCode !== null && (
        <div className="qrcode-overlay">
          <button className="close-qrcode" onClick={() => setVisibleQRCode(null)}>X</button>
          <QRCodeCanvas
            // Encode the icon's ID and background color
            value={`https://challenge-fiap-nine.vercel.app/conexoes?add=${encodeURIComponent(conexions[visibleQRCode].text)}&iconId=${encodeURIComponent(getIconIdBySrc(conexions[visibleQRCode].icon))}&bgColor=${encodeURIComponent(conexions[visibleQRCode].backgroundColor)}`}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            imageSettings={{
              src: conexions[visibleQRCode].icon, // Still use the actual image src for the QR code overlay itself
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
      )}

      {/* NEW: Device Details Modal */}
      {showDeviceDetails && (
        <div className="modal-overlay">
          <div className="device-details-modal">
            <button className="close-details-modal" onClick={() => setShowDeviceDetails(null)}>X</button>
            <h2>Detalhes do Aparelho</h2>
            <div className="details-content">
              <div className="detail-item">
                <span className="detail-label">Nome:</span>
                <span className="detail-value">{showDeviceDetails.text}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tipo:</span>
                <span className="detail-value">{getIconNameBySrc(showDeviceDetails.icon)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Conectado em:</span>
                <span className="detail-value">{formatDate(showDeviceDetails.connectedDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tempo Conectado:</span>
                <span className="detail-value">
                  {formatDuration(
                    showDeviceDetails.connected
                      ? showDeviceDetails.connectedDuration + (Date.now() - new Date(showDeviceDetails.lastStatusChange).getTime())
                      : showDeviceDetails.connectedDuration
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tempo Desconectado:</span>
                <span className="detail-value">
                  {formatDuration(
                    !showDeviceDetails.connected
                      ? showDeviceDetails.disconnectedDuration + (Date.now() - new Date(showDeviceDetails.lastStatusChange).getTime())
                      : showDeviceDetails.disconnectedDuration
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;