import React, { useState } from 'react';

const BluetoothScanner = ({ onDeviceConnected }) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [devices, setDevices] = useState([]); // lista de dispositivos conectados

  const handleBluetoothConnect = async () => {
    setStatus('Procurando dispositivos Bluetooth...');
    setError('');

    if (!navigator.bluetooth) {
      setError('Seu navegador não suporta Web Bluetooth. Use Chrome ou Edge.');
      setStatus('');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access'] // serviços extras que queremos acessar
      });

      const server = await device.gatt.connect();
      setStatus('Dispositivo conectado!');

      // Nome do dispositivo
      let deviceName = device.name || 'Nome desconhecido';

      // Tenta pegar nome real via GATT
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

      // Identificar o tipo do dispositivo
      let deviceType = 'Outro';
      if (deviceName.toLowerCase().includes('tv')) deviceType = 'TV';
      else if (deviceName.toLowerCase().includes('lamp') || deviceName.toLowerCase().includes('lâmpada')) deviceType = 'Lâmpada';

      // Atualiza a lista de dispositivos conectados
      setDevices(prev => {
        if (!prev.some(d => d.id === device.id)) {
          return [...prev, { id: device.id, name: deviceName, type: deviceType, connected: true }];
        }
        return prev.map(d =>
          d.id === device.id ? { ...d, connected: true, name: deviceName, type: deviceType } : d
        );
      });

      // Callback para o componente pai
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
