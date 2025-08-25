import React, { useState, useEffect } from 'react';

const BluetoothScanner = ({ onDeviceConnected }) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isIOS, setIsIOS] = useState(false);

  // 🔹 Ícones automáticos
  const typeIcons = {
    TV: '📺',
    Fone: '🎧',
    Caixa: '🔊',
    Celular: '📱',
    PC: '💻',
    Relogio: '⌚',
    Teclado: '⌨️',
    Mouse: '🖱️',
    Sensor: '📡',
    Lampada: '💡',
    Outro: '🔵'
  };

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // Carregar apelidos salvos
    const savedDevices = JSON.parse(localStorage.getItem('btDevices') || '{}');
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        alias: savedDevices[d.id]?.alias || d.name,
      }))
    );
  }, []);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 🔹 Detectar tipo automaticamente
  const detectType = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('tv')) return 'TV';
    if (lower.includes('fone') || lower.includes('headset') || lower.includes('earbud')) return 'Fone';
    if (lower.includes('caixa') || lower.includes('speaker')) return 'Caixa';
    if (lower.includes('phone') || lower.includes('celular') || lower.includes('iphone') || lower.includes('android')) return 'Celular';
    if (lower.includes('pc') || lower.includes('notebook') || lower.includes('laptop')) return 'PC';
    if (lower.includes('watch') || lower.includes('relogio')) return 'Relogio';
    if (lower.includes('keyboard') || lower.includes('teclado')) return 'Teclado';
    if (lower.includes('mouse')) return 'Mouse';
    if (lower.includes('sensor')) return 'Sensor';
    if (lower.includes('lamp') || lower.includes('lampada')) return 'Lampada';
    return 'Outro';
  };

  const handleBluetoothConnect = async () => {
    setStatus('🔎 Procurando dispositivos Bluetooth...');
    setError('');

    if (isIOS) {
      setError('❌ Web Bluetooth não é suportado em iOS. Use Android ou desktop.');
      setStatus('');
      return;
    }

    if (!navigator.bluetooth) {
      setError('❌ Seu navegador não suporta Web Bluetooth. Use Chrome ou Edge.');
      setStatus('');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'battery_service', 'device_information'],
      });

      const server = await device.gatt.connect();

      // Nome padrão
      let deviceName = device.name || `(desconhecido) ${device.id.slice(0, 6)}`;

      // Tenta obter nome via GATT
      try {
        const service = await server.getPrimaryService('generic_access');
        const characteristic = await service.getCharacteristic('gap.device_name');
        const value = await characteristic.readValue();
        const gattName = new TextDecoder('utf-8').decode(value);
        if (gattName) deviceName = gattName;
      } catch {}

      // Detecta tipo automaticamente
      const detectedType = detectType(deviceName);

      // Checa apelido salvo
      const savedDevices = JSON.parse(localStorage.getItem('btDevices') || '{}');
      const alias = savedDevices[device.id]?.alias || deviceName;

      // Atualiza lista
      setDevices((prev) => {
        if (!prev.some((d) => d.id === device.id)) {
          return [
            ...prev,
            { id: device.id, name: deviceName, alias, type: detectedType, connected: true, server },
          ];
        }
        return prev.map((d) =>
          d.id === device.id ? { ...d, connected: true, alias, type: detectedType } : d
        );
      });

      // Escuta desconexão
      device.addEventListener('gattserverdisconnected', () => {
        addLog(`🔌 Dispositivo ${alias} desconectado.`);
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, connected: false } : d))
        );
      });

      setStatus(`✅ Conectado a ${alias}`);
      addLog(`Conectado a ${alias}`);

      if (onDeviceConnected) {
        onDeviceConnected(device, server);
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'NotFoundError') setError('Nenhum dispositivo foi selecionado.');
      else if (err.name === 'NotAllowedError') setError('Permissão negada. Libere o acesso ao Bluetooth.');
      else setError('Erro: ' + err.message);
      setStatus('');
    }
  };

  // 🔹 Renomear (sem escolher tipo, já é automático)
  const handleRename = (id) => {
    const newName = prompt('Digite o novo nome do dispositivo:');
    if (!newName) return;

    const type = detectType(newName);

    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, alias: newName, type } : d))
    );

    const savedDevices = JSON.parse(localStorage.getItem('btDevices') || '{}');
    savedDevices[id] = { alias: newName };
    localStorage.setItem('btDevices', JSON.stringify(savedDevices));

    addLog(`✏️ Dispositivo renomeado para "${newName}" (${type})`);
  };

  // 🔹 Desconectar manualmente
  const handleDisconnect = (deviceId) => {
    const d = devices.find((d) => d.id === deviceId);
    if (d && d.server && d.server.connected) {
      d.server.disconnect();
      addLog(`🔴 Desconectado manualmente de ${d.alias}`);
      setDevices((prev) =>
        prev.map((dev) => (dev.id === deviceId ? { ...dev, connected: false } : dev))
      );
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2>🔵 Conectar via Bluetooth</h2>
      <button onClick={handleBluetoothConnect} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Procurar Dispositivos Bluetooth
      </button>

      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {devices.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📡 Dispositivos:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {devices.map((d) => (
              <li
                key={d.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: d.connected ? '#e0ffe0' : '#ffe0e0',
                }}
              >
                <span style={{ fontSize: '20px', marginRight: '5px' }}>
                  {typeIcons[d.type] || '🔵'}
                </span>
                <strong>{d.alias}</strong> <br />
                <small>(Nome original: {d.name})</small> <br />
                <strong>Tipo:</strong> {d.type} <br />
                <strong>Status:</strong> {d.connected ? '✅ Conectado' : '❌ Desconectado'}
                <br />
                <button onClick={() => handleRename(d.id)} style={{ marginTop: '5px', marginRight: '5px' }}>
                  ✏️ Renomear
                </button>
                {d.connected && (
                  <button onClick={() => handleDisconnect(d.id)} style={{ marginTop: '5px' }}>
                    🔴 Desconectar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📜 Histórico:</h3>
          <div
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              background: '#f9f9f9',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '14px',
            }}
          >
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothScanner;
