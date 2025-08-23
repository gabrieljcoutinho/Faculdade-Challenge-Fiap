import React, { useState, useEffect } from 'react';

const BluetoothScanner = ({ onDeviceConnected }) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]);

  // Detecta se o usuário está no iOS
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
  }, []);

  const handleBluetoothConnect = async () => {
    setStatus('Procurando dispositivos Bluetooth...');
    setError('');

    if (isIOS) {
      setError('Web Bluetooth não é suportado em iOS. Use Android ou desktop.');
      setStatus('');
      return;
    }

    if (!navigator.bluetooth) {
      setError('Seu navegador não suporta Web Bluetooth. Use Chrome ou Edge.');
      setStatus('');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });

      const server = await device.gatt.connect();
      setStatus('Dispositivo conectado!');

      // 1️⃣ Nome padrão do dispositivo
      let deviceName = device.name || '';

      // 2️⃣ Tentar obter nome via GATT
      try {
        const service = await server.getPrimaryService('generic_access');
        const characteristic = await service.getCharacteristic('gap.device_name');
        const value = await characteristic.readValue();
        const decoder = new TextDecoder('utf-8');
        const gattName = decoder.decode(value);
        if (gattName) deviceName = gattName;
      } catch (err) {
        console.warn('Não foi possível obter o nome via GATT:', err.message);
      }

      // 3️⃣ Fallback inteligente baseado no nome ou ID
      let deviceType = 'Outro';
      let guessedName = '';

      const lowerId = device.id.toLowerCase();
      const lowerName = deviceName.toLowerCase();

      if (lowerName.includes('tv') || lowerId.includes('tv')) {
        deviceType = 'TV';
        guessedName = deviceName || 'TV desconhecida';
      } else if (lowerName.includes('lamp') || lowerName.includes('lâmpada') || lowerId.includes('lamp')) {
        deviceType = 'Lâmpada';
        guessedName = deviceName || 'Lâmpada desconhecida';
      } else if (lowerName.includes('sensor') || lowerId.includes('sensor')) {
        deviceType = 'Sensor';
        guessedName = deviceName || 'Sensor desconhecido';
      } else {
        deviceType = 'Outro';
        guessedName = deviceName || 'Dispositivo desconhecido';
      }

      // 4️⃣ Atualiza a lista de dispositivos conectados
      setDevices(prev => {
        if (!prev.some(d => d.id === device.id)) {
          return [...prev, { id: device.id, name: guessedName, type: deviceType, connected: true }];
        }
        return prev.map(d =>
          d.id === device.id ? { ...d, connected: true, name: guessedName, type: deviceType } : d
        );
      });

      // 5️⃣ Callback para o componente pai
      if (onDeviceConnected) {
        onDeviceConnected(device, server);
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'NotFoundError') setError('Nenhum dispositivo foi selecionado.');
      else if (err.name === 'NotAllowedError') setError('Permissão negada. Libere o acesso ao Bluetooth.');
      else setError('Erro desconhecido: ' + err.message);
      setStatus('');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2>Conectar via Bluetooth</h2>
      <button onClick={handleBluetoothConnect} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Procurar Dispositivos Bluetooth
      </button>

      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {devices.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Dispositivos conectados:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {devices.map(d => (
              <li
                key={d.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  backgroundColor: d.connected ? '#e0ffe0' : '#ffe0e0'
                }}
              >
                <strong>Nome:</strong> {d.name} <br />
                <strong>Tipo:</strong> {d.type} <br />
                <strong>Status:</strong> {d.connected ? 'Conectado' : 'Desconectado'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BluetoothScanner;
