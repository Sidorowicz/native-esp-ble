import React, {useState, useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import base64 from 'base64-js';
import {Buffer} from 'buffer';

const SERVICE_UUID = '00001700-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '00001a00-0000-1000-8000-00805f9b34fb';

const Esp32Component = () => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [value, setValue] = useState('Default');

  useEffect(() => {
    return () => {
      if (manager) {
        manager.stopDeviceScan();
        manager.destroy();
      }
    };
  }, [manager]);

  const handleScan = () => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error('Scan failed:', error);
        return;
      }
      if (scannedDevice?.name === 'MyESP32') {
        manager.stopDeviceScan();
        setDevice(scannedDevice);
        console.log('Device found:', scannedDevice);
      }
    });
  };

  const handleConnect = () => {
    if (!device) return;
    manager
      .connectToDevice(device.id)
      .then(connectedDevice => {
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then(discoveredDevice => {
        console.log(
          'Connected to device and discovered services/characteristics:',
          discoveredDevice,
        );
        setDevice(discoveredDevice);
        setConnected(true);
      })
      .catch(error => {
        console.error('Connection failed:', error);
      });
  };

  const handleDisconnect = () => {
    if (!device) return;
    manager
      .cancelDeviceConnection(device.id)
      .then(() => {
        console.log('Disconnected from device');
        setConnected(false);
        setDevice(null);
      })
      .catch(error => {
        console.error('Disconnection failed:', error);
      });
  };

  const handleConnectionCheck = () => {
    if (device) {
      device
        .isConnected()
        .then(isConnected => {
          console.log(
            isConnected ? 'Device is connected' : 'Device is not connected',
          );
        })
        .catch(error => {
          console.error('Error checking connection status:', error);
        });
    } else {
      console.log('No device object available');
    }
  };

  const connectAndSendData = () => {
    if (!device) return;
    const data = '1'; // Replace with your data
    const base64Data = base64.fromByteArray(new TextEncoder().encode(data));
    console.log(device.id);
    manager
      .connectToDevice(device.id)
      .then(connectedDevice => {
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then(discoveredDevice => {
        console.log('dupa', manager);
        return manager.writeCharacteristicWithResponseForDevice(
          discoveredDevice.id,
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          base64Data,
        );
      })
      .then(() => {
        console.log('Data sent:', data);
      })
      .catch(error => {
        console.error('Failed to send data:', error);
      });
  };

  const fetchData = () => {
    if (!device) return;

    manager
      .connectToDevice(device.id)
      .then(connectedDevice => {
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then(discoveredDevice => {
        return manager.readCharacteristicForDevice(
          discoveredDevice.id,
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
        );
      })
      .then(characteristic => {
        const data = Buffer.from(characteristic.value, 'base64').toString(
          'utf-8',
        );
        console.log('Data fetched:', data);
        setValue(data);
      })
      .catch(error => {
        console.error('Failed to fetch data:', error);
      });
  };
  return (
    <View>
      <Text>{connected ? 'Connected' : 'Disconnected'}</Text>
      <Button title="Scan" onPress={handleScan} />
      <Button
        title="Connect"
        onPress={handleConnect}
        disabled={!device || connected}
      />
      <Button
        title="Disconnect"
        onPress={handleDisconnect}
        disabled={!connected}
      />
      <Button
        title="Send Data"
        onPress={connectAndSendData}
        disabled={!device}
      />
      <Button title="Fetch Data" onPress={fetchData} disabled={!device} />
      <Button title="Is Connected?" onPress={handleConnectionCheck} />
      <Text>{value}</Text>
    </View>
  );
};

export default Esp32Component;
