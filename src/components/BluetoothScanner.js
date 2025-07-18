import React, { useState } from 'react';


const BluetoothScanner = ({ onDeviceConnected }) => { 

    const [status, setStatus] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [error, setError] = useState('');

    const handleBluetoothConnect = async () => {
        setStatus('Procurando dispositivos Bluetooth...');
        setError('');
        setDeviceName('');
        setDeviceId('');

        if (!navigator.bluetooth) {
            setError('Seu navegador não suporta Web Bluetooth. Use o Chrome ou Edge.');
            return;
        }

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true
            });

            // Conectar ao GATT server imediatamente após a seleção
            const server = await device.gatt.connect();
            setStatus('Dispositivo selecionado e conectado ao GATT server!');

            setDeviceName(device.name || 'Sem nome disponível');
            setDeviceId(device.id);

            // Chamar o callback para o componente pai
            if (onDeviceConnected) {
                onDeviceConnected(device, server); // <--- Passa o device e o server
            }

        } catch (err) {
            console.error(err);
            if (err.name === 'NotFoundError') {
                setError('Nenhum dispositivo foi selecionado.');
            } else if (err.name === 'NotAllowedError') {
                setError('Permissão negada. Libere o acesso ao Bluetooth.');
            } else {
                setError('Erro desconhecido: ' + err.message);
            }
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

            {deviceName && (
                <div>
                    <p><strong>Nome do dispositivo:</strong> {deviceName}</p>
                    <p><strong>ID:</strong> {deviceId}</p>
                </div>
            )}
        </div>
    );
};

export default BluetoothScanner;