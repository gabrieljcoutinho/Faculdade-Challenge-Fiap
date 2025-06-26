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
const DEVICE_LIMIT = 5;

// Ícones disponíveis
const availableIcons = [
  { name: 'tv', src: tvIcon },
  { name: 'arcondicionado', src: airConditionerIcon },
  { name: 'lampada', src: lampIcon },
  { name: 'airfry', src: airfry },
  { name: 'carregador', src: carregador }
];

// Mapa de ícones para acesso rápido
const iconMap = availableIcons.reduce((acc, icon) => {
  acc[icon.name] = icon.src;
  return acc;
}, {});

// =========================================================================
// !!! ATENÇÃO: UUIDs E FORMATOS DE DADOS SÃO HIPOTÉTICOS NESTE EXEMPLO !!!
// VOCÊ DEVE SUBSTITUIR PELOS UUIDs E FORMATOS REAIS DOS SEUS APARELHOS.
// Use ferramentas como nRF Connect (mobile) ou a aba "Application" -> "Bluetooth" do Chrome DevTools
// para inspecionar os serviços e características do seu dispositivo real.
// =========================================================================
const DEVICE_PROFILES = {
  'lampada': {
    serviceUuid: '0000FF01-0000-1000-8000-00805F9B34FB', // Exemplo: UUID do serviço da lâmpada
    characteristics: {
      power: {
        uuid: '0000FF02-0000-1000-8000-00805F9B34FB',
        onValue: new Uint8Array([0x01]), // Ex: 1 para LIGAR
        offValue: new Uint8Array([0x00]), // Ex: 0 para DESLIGAR
      },
      brightness: {
        uuid: '0000FF03-0000-1000-8000-00805F9B34FB',
        writeValue: (level) => new Uint8Array([level]), // Ex: 0-255
      }
    }
  },
  'tv': {
    serviceUuid: '0000AA00-0000-1000-8000-00805F9B34FB', // Exemplo: UUID do serviço da TV
    characteristics: {
      power: {
        uuid: '0000AA01-0000-1000-8000-00805F9B34FB',
        onValue: new Uint8Array([0x01]),
        offValue: new Uint8Array([0x00]),
      },
      volume: {
        uuid: '0000AA02-0000-1000-8000-00805F9B34FB',
        increaseValue: new Uint8Array([0x01]), // Ex: 1 para aumentar
        decreaseValue: new Uint8Array([0x02]), // Ex: 2 para diminuir
        muteValue: new Uint8Array([0x03]), // Ex: 3 para mudo
      }
    }
  },
  'arcondicionado': {
    serviceUuid: '0000BB00-0000-1000-8000-00805F9B34FB', // Exemplo: UUID do serviço do Ar Condicionado
    characteristics: {
      power: {
        uuid: '0000BB01-0000-1000-8000-00805F9B34FB',
        onValue: new Uint8Array([0x01]),
        offValue: new Uint8Array([0x00]),
      },
      temperature: {
        uuid: '0000BB02-0000-1000-8000-00805F9B34FB',
        writeValue: (temp) => new Uint8Array([temp]), // Ex: temperatura em Celsius
      },
      mode: {
        uuid: '0000BB03-0000-1000-8000-00805F9B34FB',
        coolValue: new Uint8Array([0x01]),
        heatValue: new Uint8Array([0x02]),
      }
    }
  }
};

const Conexoes = ({ conexions, setConexions, onConnectDevice, onRemoveDevice, onToggleConnection }) => {
  const location = useLocation();

  // Estados de UI
  const [showAddForm, setShowAddForm] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [isSearchingBluetooth, setIsSearchingBluetooth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [visibleQRCode, setVisibleQRCode] = useState(null);
  const [selectedConexion, setSelectedConexion] = useState(null);

  // Ref para armazenar os objetos BluetoothDevice e GATTServer ativos
  const activeBluetoothDevices = useRef({});

  // Dados do formulário (agora inclui 'type' para aparelhos manuais)
  const [newConexion, setNewConexion] = useState({
    text: '',
    icon: '',
    backgroundColor: availableColors[0],
    connected: true,
    connectedDate: new Date().toISOString(),
    type: null // Novo campo para o tipo do aparelho
  });
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeColor, setActiveColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [conexionToDelete, setConexionToDelete] = useState(null);

  // Limpa refs de Bluetooth quando o componente é desmontado
  useEffect(() => {
    return () => {
      Object.values(activeBluetoothDevices.current).forEach(({ gattServer }) => {
        if (gattServer && gattServer.connected) {
          gattServer.disconnect();
          console.log("Desconectado GATT server ao desmontar componente.");
        }
      });
      activeBluetoothDevices.current = {}; // Limpa a ref
    };
  }, []);

  // Handle params URL para adicionar direto
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get('add');
    const iconKey = params.get('icon');

    if (nome && iconKey && iconMap[iconKey]) {
      if (conexions.length >= DEVICE_LIMIT) {
        setShowLimitWarning(true);
      } else {
        // Para aparelhos adicionados via URL, eles são considerados "virtuais"
        // sem uma conexão Bluetooth ativa real por padrão.
        // Tentamos adivinhar o tipo a partir do nome aqui também.
        const guessedType = guessDeviceType(nome);
        onConnectDevice(nome, nome, iconMap[iconKey], availableColors[0], null, null, guessedType);
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, onConnectDevice, conexions.length]);

  // Função para obter o nome do ícone a partir do src
  const getIconKeyBySrc = (src) => {
    const found = availableIcons.find(icon => icon.src === src);
    return found ? found.name : '';
  };

  // Função para adivinhar o tipo do aparelho com base no nome
  const guessDeviceType = (deviceName) => {
    const name = deviceName.toLowerCase();
    if (name.includes('tv') || name.includes('televisão') || name.includes('smart tv') || name.includes('monitor')) {
      return 'tv';
    } else if (name.includes('ar') || name.includes('ac') || name.includes('condicionado') || name.includes('split') || name.includes('climatizador')) {
      return 'arcondicionado';
    } else if (name.includes('lamp') || name.includes('lâmpada') || name.includes('lampada') || name.includes('led') || name.includes('smart light') || name.includes('bulb')) {
      return 'lampada';
    }
    // Adicione mais regras conforme necessário para outros tipos que você queira controlar
    return null; // Retorna null se não conseguir adivinhar
  };

  // Abrir formulário para adicionar (modo bluetooth por padrão)
  const handleAddClick = () => {
    setNewConexion({
      text: '',
      icon: '',
      backgroundColor: availableColors[0],
      connected: true,
      connectedDate: new Date().toISOString(),
      type: null
    });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setEditingId(null);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false);
    setShowAddForm(true);
    setIsSearchingBluetooth(false);
    setModoManual(false); // Sempre começar em modo Bluetooth ao abrir
  };

  // Abrir formulário manual
  const abrirModoManual = () => {
    setModoManual(true);
    setNewConexion({
      text: '',
      icon: '',
      backgroundColor: availableColors[0],
      connected: true,
      connectedDate: new Date().toISOString(),
      type: null // Limpa o tipo ao iniciar o modo manual
    });
    setActiveIcon(null);
    setActiveColor(availableColors[0]);
    setErrorMessage('');
    setEditingId(null);
    setIsSearchingBluetooth(false);
  };

  // =====================================================================
  // *** FUNÇÃO GENÉRICA PARA ENVIAR COMANDOS BLUETOOTH ***
  // =====================================================================
  const sendBluetoothCommand = async (device, server, serviceUuid, characteristicUuid, value) => {
    if (!device || !server || !server.connected) {
      throw new Error("Conexão Bluetooth não está ativa para este dispositivo.");
    }

    try {
      const service = await server.getPrimaryService(serviceUuid);
      console.log(`Serviço Bluetooth ${serviceUuid} encontrado.`);
      const characteristic = await service.getCharacteristic(characteristicUuid);
      console.log(`Característica ${characteristicUuid} encontrada.`);

      await characteristic.writeValue(value);
      console.log(`Comando enviado para ${device.name}: Característica ${characteristicUuid}, Valor:`, value);
      return true;
    } catch (error) {
      console.error(`Erro ao enviar comando Bluetooth para ${device.name}:`, error);
      throw error;
    }
  };

  // Buscar dispositivos Bluetooth e conectar
  const handleSearchAndConnectBluetooth = async () => {
    if (!navigator.bluetooth) {
      setErrorMessage('Seu navegador não suporta Web Bluetooth. Use Chrome, Edge ou Opera.');
      return;
    }

    if (conexions.length >= DEVICE_LIMIT) {
      setShowLimitWarning(true);
      return;
    }

    setIsSearchingBluetooth(true);
    setErrorMessage('');

    try {
      // Solicita o dispositivo. Isso abre a UI do navegador.
      // Você pode adicionar filtros aqui para serviços conhecidos,
      // o que ajuda o navegador a mostrar dispositivos mais relevantes.
      const device = await navigator.bluetooth.requestDevice({
        // filters: [ // Use filters se quiser mostrar apenas certos tipos de dispositivos
        //   { services: [DEVICE_PROFILES.lampada.serviceUuid] },
        //   { services: [DEVICE_PROFILES.tv.serviceUuid] },
        //   { services: [DEVICE_PROFILES.arcondicionado.serviceUuid] },
        // ],
        acceptAllDevices: true, // Mantido para demonstrar a busca geral
        optionalServices: Object.values(DEVICE_PROFILES).flatMap(profile =>
          Object.values(profile.characteristics).map(char => char.uuid)
        ) // Permite acessar outras características após a conexão
      });

      if (!device) {
        setErrorMessage('Nenhum aparelho Bluetooth selecionado.');
        return;
      }

      // Tenta conectar ao GATT Server IMEDIATAMENTE após a seleção
      const server = await device.gatt.connect();
      console.log(`Conectado ao GATT server do aparelho: ${device.name || 'Desconhecido'}`);

      // Armazena a referência do dispositivo e do servidor GATT
      activeBluetoothDevices.current[device.id] = { bluetoothDevice: device, gattServer: server };

      // Opcional: Adicionar um ouvinte para desconexão
      device.addEventListener('gattserverdisconnected', () => {
        console.log(`GATT server de ${device.name} (${device.id}) desconectado.`);
        onToggleConnection(device.id, false); // Atualiza o estado da UI para desconectado
        delete activeBluetoothDevices.current[device.id]; // Remove da ref quando desconectado
      });

      const deviceName = device.name || 'Dispositivo Bluetooth Desconhecido';

      // --- Melhorando o mapeamento de ícones e adivinhando o tipo ---
      let guessedIcon = lampIcon; // Fallback padrão
      const deviceType = guessDeviceType(deviceName); // Adivinha o tipo do aparelho

      if (deviceType === 'tv') guessedIcon = tvIcon;
      else if (deviceType === 'arcondicionado') guessedIcon = airConditionerIcon;
      else if (deviceType === 'lampada') guessedIcon = lampIcon;
      // Adicione aqui se quiser mapear airfryer/carregador para tipos específicos de BLE
      else if (deviceName.toLowerCase().includes('airfry')) guessedIcon = airfry;
      else if (deviceName.toLowerCase().includes('carregador')) guessedIcon = carregador;
      // --- FIM DA ALTERAÇÃO ---

      // Verifica se já existe um aparelho com este ID Bluetooth (evita duplicatas reais)
      if (conexions.some(c => c.bluetoothDevice && c.bluetoothDevice.id === device.id)) {
        setErrorMessage(`Este aparelho Bluetooth (${deviceName}) já está na sua lista.`);
        server.disconnect(); // Desconecta imediatamente se for duplicado
        delete activeBluetoothDevices.current[device.id];
        return;
      }

      // Passa o tipo do aparelho para onConnectDevice
      onConnectDevice(deviceName, device.id, guessedIcon, availableColors[0], device, server, deviceType);
      setShowAddForm(false);

    } catch (error) {
      console.error('Erro ao conectar via Bluetooth:', error);
      if (error.name === 'NotFoundError') setErrorMessage('Nenhum aparelho Bluetooth encontrado ou selecionado.');
      else if (error.name === 'NotAllowedError') setErrorMessage('Permissão de Bluetooth negada ou usuário cancelou.');
      else if (error.message.includes('User cancelled')) setErrorMessage('Seleção de aparelho Bluetooth cancelada.');
      else setErrorMessage('Falha na conexão Bluetooth: ' + error.message);
    } finally {
      setIsSearchingBluetooth(false);
    }
  };

  // Salvar edição do dispositivo
  const saveEditedConexion = () => {
    if (!newConexion.text.trim() || !newConexion.icon) {
      setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊');
      return;
    }

    if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase() && c.id !== editingId)) {
      setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`);
      return;
    }

    setConexions(prev => prev.map(c =>
      c.id === editingId
        ? {
          ...newConexion,
          id: c.id,
          connectedDate: c.connectedDate,
          bluetoothDevice: c.bluetoothDevice,
          gattServer: c.gattServer, // Garante que a referência do GATT server seja mantida
          type: newConexion.type || guessDeviceType(newConexion.text) // Atualiza tipo ao editar manualmente
        }
        : c
    ));
    setShowAddForm(false);
    setModoManual(false);
    setErrorMessage('');
  };

  // Solicitar remoção do aparelho (abre confirmação)
  const removeConexion = (id) => {
    setConexionToDelete(id);
    setShowConfirmDialog(true);
  };

  // Confirmar remoção do aparelho
  const handleConfirmRemove = () => {
    if (conexionToDelete) {
      setRemovingId(conexionToDelete);
      // Desconecta o GATT server se estiver ativo para este aparelho
      const deviceRef = activeBluetoothDevices.current[conexionToDelete];
      if (deviceRef && deviceRef.gattServer && deviceRef.gattServer.connected) {
        deviceRef.gattServer.disconnect();
        console.log(`Desconectado GATT server para aparelho ${conexionToDelete} antes de remover.`);
      }
      delete activeBluetoothDevices.current[conexionToDelete]; // Remove da ref

      setTimeout(() => {
        onRemoveDevice(conexionToDelete); // Remove do estado global
        setRemovingId(null);
        setSelectedConexion(null);
        setConexionToDelete(null);
        setShowConfirmDialog(false);
      }, 300);
    }
  };

  // Cancelar remoção
  const handleCancelRemove = () => {
    setConexionToDelete(null);
    setShowConfirmDialog(false);
  };

  // Abrir edição do dispositivo
  const handleEditClick = (c) => {
    setNewConexion({
      text: c.text,
      icon: c.icon,
      backgroundColor: c.backgroundColor || availableColors[0],
      connected: c.connected,
      connectedDate: c.connectedDate,
      type: c.type || guessDeviceType(c.text) // Preenche o tipo existente ou tenta adivinhar
    });
    setActiveIcon(c.icon);
    setActiveColor(c.backgroundColor || availableColors[0]);
    setEditingId(c.id);
    setErrorMessage('');
    setSelectedConexion(null);
    setShowLimitWarning(false);
    setShowAddForm(true);
    setIsSearchingBluetooth(false);
    setModoManual(true); // Modo formulário para editar
  };

  // Alternar status conexão (on/off) - AGORA CONTROLA O APARELHO REALMENTE!
  const toggleConnection = async (id, currentConnectedState) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion) return;

    const newDesiredState = !currentConnectedState; // O novo estado desejado

    // Tenta controlar o aparelho Bluetooth real se ele foi conectado via Bluetooth API e tem um perfil
    const bluetoothRef = activeBluetoothDevices.current[id];

    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer && conexion.type && DEVICE_PROFILES[conexion.type]) {
      try {
        const profile = DEVICE_PROFILES[conexion.type];
        const powerChar = profile.characteristics.power;

        if (!powerChar || !powerChar.uuid) {
          console.warn(`Perfil de ${conexion.type} não tem característica de energia definida.`);
          // Se não tem power char, apenas alterna o UI (comporta-se como um aparelho manual)
          onToggleConnection(id, newDesiredState);
          return;
        }

        const valueToSend = newDesiredState ? powerChar.onValue : powerChar.offValue;
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          powerChar.uuid,
          valueToSend
        );
        onToggleConnection(id, newDesiredState); // Atualiza o estado da UI após sucesso
        if (selectedConexion && selectedConexion.id === id && !newDesiredState) {
          setSelectedConexion(null); // Fecha detalhes se desligou
        }
        setErrorMessage(''); // Limpa qualquer erro anterior
      } catch (error) {
        console.error("Falha ao enviar comando Bluetooth:", error);
        setErrorMessage(`Não foi possível controlar ${conexion.text}. O aparelho pode estar fora de alcance ou desconectado. Detalhes: ${error.message}`);
        onToggleConnection(id, false); // Força para desconectado no UI em caso de erro no controle real
      }
    } else {
      // Se não é um aparelho Bluetooth real ou não tem ref ativa/perfil, apenas alterna o estado visual
      onToggleConnection(id, newDesiredState);
      if (selectedConexion && selectedConexion.id === id && !newDesiredState) {
        setSelectedConexion(null);
      }
      setErrorMessage(''); // Limpa qualquer erro anterior
    }
  };

  // Funções de controle específicas para diferentes tipos de aparelhos
  const handleVolumeUp = async (id) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'tv' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.tv;
        const volumeChar = profile.characteristics.volume;
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          volumeChar.uuid,
          volumeChar.increaseValue
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao aumentar volume de ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  const handleVolumeDown = async (id) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'tv' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.tv;
        const volumeChar = profile.characteristics.volume;
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          volumeChar.uuid,
          volumeChar.decreaseValue
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao diminuir volume de ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  const handleMuteToggle = async (id) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'tv' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.tv;
        const volumeChar = profile.characteristics.volume;
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          volumeChar.uuid,
          volumeChar.muteValue
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao silenciar ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  const handleSetTemperature = async (id, temperature) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'arcondicionado' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.arcondicionado;
        const tempChar = profile.characteristics.temperature;
        const valueToSend = tempChar.writeValue(temperature);
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          tempChar.uuid,
          valueToSend
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao definir temperatura de ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  const handleSetAcMode = async (id, modeValue) => { // modeValue seria tipo 0x01 para cool, 0x02 para heat
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'arcondicionado' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.arcondicionado;
        const modeChar = profile.characteristics.mode;
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          modeChar.uuid,
          modeValue
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao definir modo do ar condicionado ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  const handleSetBrightness = async (id, brightnessLevel) => {
    const conexion = conexions.find(device => device.id === id);
    if (!conexion || conexion.type !== 'lampada' || !conexion.connected) return;

    const bluetoothRef = activeBluetoothDevices.current[id];
    if (bluetoothRef && bluetoothRef.bluetoothDevice && bluetoothRef.gattServer) {
      try {
        const profile = DEVICE_PROFILES.lampada;
        const brightnessChar = profile.characteristics.brightness;
        const valueToSend = brightnessChar.writeValue(brightnessLevel);
        await sendBluetoothCommand(
          bluetoothRef.bluetoothDevice,
          bluetoothRef.gattServer,
          profile.serviceUuid,
          brightnessChar.uuid,
          valueToSend
        );
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(`Erro ao definir brilho de ${conexion.text}: ${error.message}`);
      }
    } else {
      setErrorMessage(`Aparelho ${conexion.text} não está conectado via Bluetooth.`);
    }
  };

  // Abrir modal detalhes do dispositivo
  const handleConexionClick = (c) => {
    setSelectedConexion(c);
  };

  // Formatação da data
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Calcular duração de conexão
  const getConnectionDuration = (connectedDateString) => {
    if (!connectedDateString) return 'N/A';
    const connected = new Date(connectedDateString);
    const now = new Date();
    const diff = now - connected;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let duration = [];
    if (days > 0) duration.push(`${days} dia(s)`);
    if (hours % 24 > 0) duration.push(`${hours % 24} hora(s)`);
    // Para minutos e segundos, só mostra se a duração total for menor que um dia/hora
    if (minutes % 60 > 0 && days === 0) duration.push(`${minutes % 60} minuto(s)`);
    if (seconds % 60 > 0 && hours === 0 && days === 0) duration.push(`${seconds % 60} segundo(s)`);

    if (duration.length === 0) return 'Menos de um segundo';
    return duration.join(' e ');
  };

  return (
    <div className="conexao-container">
      <h1 className='tituloConexao'>Aparelhos Conectados</h1>

      <button className="add-button-styled" onClick={handleAddClick}>
        <span className="plus-icon">+</span> Adicionar Aparelho
      </button>

      {conexions.length === 0 && !showAddForm && (
        <div className="placeholder-image-container">
          <br /><br /><br />
          <img src={placeholderImage} alt="Nenhum aparelho conectado" className="placeholder-image" />
          <p className="placeholder-text">Nenhum aparelho conectado...</p>
        </div>
      )}

      {/* Formulário para adicionar ou editar aparelho */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-form-styled">
            <h2>{editingId ? 'Editar Aparelho' : modoManual ? 'Adicionar Novo Aparelho Manualmente' : 'Adicionar Novo Aparelho'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {(editingId || modoManual) ? (
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
                    {availableIcons.map(icon => (
                      <button
                        key={icon.name}
                        className={`icon-option ${activeIcon === icon.src ? 'active' : ''}`}
                        onClick={() => { setNewConexion({ ...newConexion, icon: icon.src, type: guessDeviceType(newConexion.text || icon.name) }); setActiveIcon(icon.src); }}
                        type="button"
                      >
                        <img src={icon.src} alt={icon.name} style={{ width: 30, height: 30 }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="color-picker-styled">
                  <label className="tipoDoFundoConexao">Escolha a cor de fundo:</label>
                  <div className="colors">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${activeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => { setNewConexion({ ...newConexion, backgroundColor: color }); setActiveColor(color); }}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
                {/* Seleção do tipo de aparelho para aparelhos manuais */}
                {modoManual && (
                  <div className="device-type-picker">
                    <label>Tipo de Aparelho (para controle):</label>
                    <select
                      value={newConexion.type || ''}
                      onChange={(e) => setNewConexion({ ...newConexion, type: e.target.value || null })}
                    >
                      <option value="">Automático (pelo nome) / Nenhum</option>
                      {Object.keys(DEVICE_PROFILES).map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-actions">
                  <button
                    onClick={editingId ? saveEditedConexion : () => {
                      if (!newConexion.text.trim() || !newConexion.icon) {
                        setErrorMessage('Dê um nome e selecione um ícone para o aparelho 😊');
                        return;
                      }
                      if (conexions.some(c => c.text.toLowerCase() === newConexion.text.toLowerCase())) {
                        setErrorMessage(`Já existe um aparelho com o nome "${newConexion.text}".`);
                        return;
                      }
                      // Para aparelhos adicionados manualmente, não há BluetoothDevice
                      // O tipo é pego do estado newConexion.type ou adivinhado pelo nome
                      const finalType = newConexion.type || guessDeviceType(newConexion.text);
                      onConnectDevice(
                        newConexion.text,
                        Date.now().toString(), // ID único para aparelhos manuais
                        newConexion.icon,
                        newConexion.backgroundColor,
                        null, // bluetoothDevice
                        null,  // bluetoothGattServer
                        finalType // Passa o tipo para aparelhos manuais
                      );
                      setShowAddForm(false);
                      setModoManual(false);
                      setErrorMessage('');
                    }}
                    className="save-button-styled"
                    type="button"
                  >
                    {editingId ? 'Salvar Edição' : 'Adicionar Aparelho'}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setModoManual(false); setErrorMessage(''); }}
                    className="cancel-button-styled"
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Clique no botão abaixo para **procurar e conectar aparelhos Bluetooth próximos**. Seu navegador irá abrir uma janela para você selecionar o dispositivo.</p>
                <button
                  onClick={handleSearchAndConnectBluetooth}
                  className="add-button-styled"
                  disabled={isSearchingBluetooth}
                  type="button"
                >
                  {isSearchingBluetooth ? 'Procurando Aparelhos...' : 'Procurar Aparelhos Bluetooth'}
                </button>
                <button
                  onClick={abrirModoManual}
                  className="add-button-styled"
                  style={{ marginTop: '10px' }}
                  disabled={isSearchingBluetooth}
                  type="button"
                >
                  Adicionar Aparelho Manualmente
                </button>
                {isSearchingBluetooth && (
                  <p className="connecting-message">Aguarde, a janela de seleção do navegador será aberta.</p>
                )}
                <div className="form-actions">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="cancel-button-styled"
                    disabled={isSearchingBluetooth}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Lista de aparelhos conectados */}
      <div className="conexions-list">
        {conexions.map(c => (
          <div
            key={c.id}
            className={`retanguloAdicionado ${removingId === c.id ? 'exiting' : ''}`}
            style={{ backgroundColor: c.connected ? (c.backgroundColor || '#e0e0e0') : '#696969' }}
            onClick={() => handleConexionClick(c)}
          >
            {/* Somente mostra QR Code se o aparelho estiver "conectado" no UI (independente do Bluetooth real) */}
            {c.connected && (
              <div className="qrcode-top-left">
                <button
                  className="qrcode-button"
                  onClick={(e) => { e.stopPropagation(); setVisibleQRCode(c); }}
                  type="button"
                >
                  <img src={imgQrcode} alt="QR Code" className="qrCodeAparelhoConectado" />
                </button>
              </div>
            )}
            {!c.connected && <div className="disconnected-overlay">Desativado</div>}
            <div className="icon-text-overlay">
              <img src={c.icon} alt={c.text} className="conexion-icon-overlay" style={{ opacity: c.connected ? 1 : 0.5 }} />
              <span className="conexion-text-overlay" style={{ color: c.connected ? 'inherit' : '#a9a9a9' }}>{c.text}</span>
            </div>
            <div className="actions-overlay">
              <button
                className="remove-button"
                onClick={(e) => { e.stopPropagation(); removeConexion(c.id); }}
                type="button"
              >
                ×
              </button>
              <button
                className="edit-button"
                onClick={(e) => { e.stopPropagation(); handleEditClick(c); }}
                type="button"
                disabled={!c.connected} // Desabilita edição se o aparelho estiver "desligado" no UI
              >
                <img src={editIcon} alt="Editar" style={{ width: 16, height: 16 }} />
              </button>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={c.connected}
                  // Chama a nova função toggleConnection com o ID e o estado atual
                  onChange={(e) => { e.stopPropagation(); toggleConnection(c.id, c.connected); }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalhes aparelho */}
      {selectedConexion && (
        <div className="modal-overlay" onClick={() => setSelectedConexion(null)}>
          <div className="conexion-details-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedConexion.text}</h3>
            <img
              src={selectedConexion.icon}
              alt={selectedConexion.text}
              style={{ width: 80, height: 80 }}
            />
            <p>
              <strong>Status:</strong> {selectedConexion.connected ? 'Conectado' : 'Desativado'}
            </p>
            {selectedConexion.bluetoothDevice && (
              <p>
                <strong>ID Bluetooth:</strong> {selectedConexion.bluetoothDevice.id}
              </p>
            )}
            {selectedConexion.type && (
              <p>
                <strong>Tipo:</strong> {selectedConexion.type.charAt(0).toUpperCase() + selectedConexion.type.slice(1)}
              </p>
            )}
            <p>
              <strong>Data de conexão:</strong> {formatDate(selectedConexion.connectedDate)}
            </p>
            <p>
              <strong>Duração da conexão:</strong> {getConnectionDuration(selectedConexion.connectedDate)}
            </p>

            {/* Controles Específicos por Tipo de Aparelho */}
            {selectedConexion.connected && selectedConexion.bluetoothDevice && selectedConexion.type === 'tv' && (
              <div className="device-controls">
                <h4>Controles da TV</h4>
                <button onClick={() => handleVolumeUp(selectedConexion.id)}>Volume +</button>
                <button onClick={() => handleVolumeDown(selectedConexion.id)}>Volume -</button>
                <button onClick={() => handleMuteToggle(selectedConexion.id)}>Mudo</button>
              </div>
            )}

            {selectedConexion.connected && selectedConexion.bluetoothDevice && selectedConexion.type === 'arcondicionado' && (
              <div className="device-controls">
                <h4>Controles do Ar Condicionado</h4>
                <label>Temperatura:</label>
                <input
                  type="number"
                  min="16"
                  max="30"
                  defaultValue="22"
                  onChange={(e) => handleSetTemperature(selectedConexion.id, parseInt(e.target.value))}
                />
                <button onClick={() => handleSetAcMode(selectedConexion.id, DEVICE_PROFILES.arcondicionado.characteristics.mode.coolValue)}>Modo Frio</button>
                <button onClick={() => handleSetAcMode(selectedConexion.id, DEVICE_PROFILES.arcondicionado.characteristics.mode.heatValue)}>Modo Quente</button>
              </div>
            )}

            {selectedConexion.connected && selectedConexion.bluetoothDevice && selectedConexion.type === 'lampada' && (
              <div className="device-controls">
                <h4>Controles da Lâmpada</h4>
                <label>Brilho: </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  defaultValue="128"
                  onChange={(e) => handleSetBrightness(selectedConexion.id, parseInt(e.target.value))}
                />
              </div>
            )}
            {selectedConexion.bluetoothDevice && !selectedConexion.connected && (
                <p className="error-message">Este aparelho Bluetooth está desconectado. Ative-o novamente pelo botão abaixo ou na lista.</p>
            )}
            {selectedConexion.bluetoothDevice && selectedConexion.connected && !selectedConexion.type && (
                <p className="error-message">Não foi possível determinar o tipo deste aparelho Bluetooth. Controles específicos podem não estar disponíveis.</p>
            )}


            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button
              className="close-button-styled"
              onClick={() => setSelectedConexion(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmação remoção */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={handleCancelRemove}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <p>Tem certeza que deseja remover este aparelho?</p>
            <div className="confirmation-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Sim</button>
              <button onClick={handleCancelRemove} className="cancel-button">Não</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal aviso limite aparelhos */}
      {showLimitWarning && (
        <div className="modal-overlay" onClick={() => setShowLimitWarning(false)}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <p>Você atingiu o limite máximo de aparelhos conectados ({DEVICE_LIMIT}).</p>
            <button onClick={() => setShowLimitWarning(false)} className="confirm-button">OK</button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {visibleQRCode && (
        <div className="modal-overlay" onClick={() => setVisibleQRCode(null)}>
          <div className="qr-code-modal" onClick={e => e.stopPropagation()}>
            <QRCodeCanvas
              value={`${siteBaseURL}/aparelho/${encodeURIComponent(visibleQRCode.text)}`}
              size={256}
              level="H"
              includeMargin={true}
            />
            <button className="close-button" onClick={() => setVisibleQRCode(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conexoes;